import { nanoid } from 'nanoid';
import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';
import {
  AUDIO_SHAPE_WIDTH,
  AUDIO_SHAPE_HEIGHT,
  type AudioShape,
  checkAudioMagicBytes,
} from '../shapes/audio';
import { ALLOWED_AUDIO_MIME_TYPES } from '../constants/mimeTypes';
import { resolveShapeCoordinates } from '../utils';
import i18n from 'i18next';

const MAX_AUDIO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_AUDIO_SHAPES = 20;

/** Строка для input.accept (из whitelist MIME). */
export const AUDIO_ACCEPT = Array.from(ALLOWED_AUDIO_MIME_TYPES).join(',');

async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    audio.addEventListener('loadedmetadata', () => {
      const dur = audio.duration;
      cleanup();
      resolve(isFinite(dur) && dur > 0 ? dur : 0);
    });

    audio.addEventListener('error', () => {
      cleanup();
      resolve(0);
    });

    audio.src = objectUrl;
  });
}

export async function insertAudio(editor: Editor, file: File, token: string) {
  if (!ALLOWED_AUDIO_MIME_TYPES.has(file.type)) {
    toast.error(i18n.t('toast.unsupportedFormat', { ns: 'board' }), {
      description: i18n.t('toast.audioFormatDesc', { ns: 'board' }),
      duration: 5000,
    });
    return;
  }

  const signatureValid = await checkAudioMagicBytes(file);
  if (!signatureValid) {
    toast.error(i18n.t('toast.audioInvalidFormat', { ns: 'board' }), {
      description: i18n.t('toast.audioInvalidFormatDesc', { ns: 'board' }),
      duration: 5000,
    });
    return;
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    toast.error(i18n.t('toast.fileTooLarge', { ns: 'board' }), {
      description: i18n.t('toast.audioSizeDesc', {
        ns: 'board',
        size: (file.size / 1024 / 1024).toFixed(2),
      }),
      duration: 5000,
    });
    return;
  }

  const existingCount = editor.getCurrentPageShapes().filter((s) => s.type === 'audio').length;

  if (existingCount >= MAX_AUDIO_SHAPES) {
    toast.error(i18n.t('toast.audioLimitTitle', { ns: 'board' }), {
      description: i18n.t('toast.audioLimitDesc', { ns: 'board', max: MAX_AUDIO_SHAPES }),
      duration: 5000,
    });
    return;
  }

  const shapeId = `shape:${nanoid()}` as DrShapeId;
  const duration = await getAudioDuration(file);
  const coordinates = resolveShapeCoordinates(editor, AUDIO_SHAPE_WIDTH, AUDIO_SHAPE_HEIGHT);

  editor.createShapes<AudioShape>([
    {
      id: shapeId,
      type: 'audio',
      x: coordinates.x,
      y: coordinates.y,
      props: {
        src: '',
        fileName: file.name,
        fileSize: file.size,
        duration,
        w: AUDIO_SHAPE_WIDTH,
        h: AUDIO_SHAPE_HEIGHT,
        syncPlayback: false,
        studentsCanAddTimecodes: false,
        timecodesVisibleByDefault: true,
        timecodes: [],
      },
    },
  ]);

  editor.setSelectedShapes([shapeId]);
  Promise.resolve().then(() => {
    editor.zoomToSelection({ animation: { duration: 200 } });
  });

  (async () => {
    try {
      const serverUrl = await uploadFileRequest({ file, token });

      editor.updateShape<AudioShape>({
        id: shapeId,
        type: 'audio',
        props: { src: serverUrl },
      });
    } catch (err) {
      console.error('[insertAudio] Upload failed:', err);
      const msg =
        err instanceof Error ? err.message : i18n.t('toast.audioUploadFailed', { ns: 'board' });
      toast.error(i18n.t('toast.audioUploadError', { ns: 'board' }), {
        description: msg,
        duration: 5000,
      });
      editor.deleteShapes([shapeId]);
    }
  })();
}
