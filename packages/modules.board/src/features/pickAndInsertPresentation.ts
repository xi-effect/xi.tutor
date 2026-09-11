import { nanoid } from 'nanoid';
import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { prepareContentUpload, uploadFileIdRequest } from 'common.services';
import { PresentationShape } from '../shapes/presentation';

import { getBoardUploadErrorToast } from '../utils/boardUploadError';
import { assertBoardUploadAllowed } from '../utils/planUploadLimit';
import { getMaxFileBytes } from 'common.subscription';
import {
  beginFileUploadAttempt,
  rejectFileUploadFromError,
  trackBoardObjectsLimitReached,
} from 'common.utils';
import i18n from 'i18next';

const MAX_PRESENTATION_SHAPES = 20;

const DEFAULT_WIDTH = 720;

export async function insertPresentation(editor: Editor, file: File, token: string) {
  const attempt = beginFileUploadAttempt('board', file);

  if (!file.name.toLowerCase().endsWith('.pptx')) {
    attempt.reject('unsupported_type');
    toast.error(i18n.t('toast.unsupportedFormat', { ns: 'board' }), {
      description: i18n.t('toast.presentationFormatDesc', { ns: 'board' }),
      duration: 5000,
    });

    return;
  }

  file = prepareContentUpload(file).file;

  if (!assertBoardUploadAllowed(file, 'other', attempt)) {
    return;
  }

  const count = editor
    .getCurrentPageShapes()
    .filter((shape) => shape.type === 'presentation').length;

  if (count >= MAX_PRESENTATION_SHAPES) {
    trackBoardObjectsLimitReached('presentation');
    attempt.reject('unknown');
    toast.error(i18n.t('toast.presentationLimitTitle', { ns: 'board' }), {
      description: i18n.t('toast.presentationLimitDesc', {
        ns: 'board',
        max: MAX_PRESENTATION_SHAPES,
      }),
      duration: 5000,
    });

    return;
  }

  const shapeId = `shape:${nanoid()}` as DrShapeId;

  const width = DEFAULT_WIDTH;
  const height = Math.round((DEFAULT_WIDTH * 9) / 16);

  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createShapes([
    {
      id: shapeId,
      type: 'presentation',
      x: viewportCenter.x - width / 2,
      y: viewportCenter.y - height / 2,
      props: {
        src: '',
        fileName: file.name,
        totalSlides: 0,
        currentSlide: 1,
        w: width,
        h: height,
        studentCanFlip: true,
      },
    },
  ]);

  try {
    const serverUrl = await uploadFileIdRequest({
      file,
      token,
    });

    editor.updateShape<PresentationShape>({
      id: shapeId,
      type: 'presentation',
      props: {
        src: serverUrl,
      },
    });
    attempt.succeed();
  } catch (err) {
    console.error('[insertPresentation] upload failed', err);
    rejectFileUploadFromError(attempt, err, {
      fileSize: file.size,
      maxBytes: getMaxFileBytes(),
    });

    const { title, description } = getBoardUploadErrorToast(err, file, getMaxFileBytes(), {
      sizeDescKey: 'toast.presentationSizeDesc',
      failedTitleKey: 'toast.presentationUploadError',
      failedDescKey: 'toast.presentationUploadFailed',
      formatDescKey: 'toast.presentationFormatDesc',
    });
    toast.error(title, { description, duration: 5000 });

    editor.deleteShapes([shapeId]);
  }
}
