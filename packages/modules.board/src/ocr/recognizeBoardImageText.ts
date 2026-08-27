import type { DrImageShape, DrShapeId, Editor } from '@ibodr/draw';
import i18n from 'i18next';
import { toast } from 'sonner';
import { getImageBlobFromShape } from './getImageBlobFromShape';
import { insertOcrTextShape } from './insertOcrTextShape';
import { useOcrProcessingStore } from './ocrStores';
import { OcrImageLoadError, OcrNoTextError, type OcrLanguage, type OcrProvider } from './types';

async function runRecognizeOnShape(
  editor: Editor,
  shapeId: DrShapeId,
  language: OcrLanguage,
  getBlob: () => Promise<Blob>,
  provider?: OcrProvider,
): Promise<void> {
  const processing = useOcrProcessingStore.getState();
  if (processing.isProcessing(shapeId)) return;

  const shape = editor.getShape(shapeId);
  if (!shape || !('w' in shape.props) || typeof shape.props.w !== 'number') return;

  processing.start(shapeId);

  try {
    const ocrProvider = provider ?? (await import('./paddleOcrProvider')).paddleOcrProvider;
    const blob = await getBlob();
    const { text } = await ocrProvider.recognizeImageText(blob, { language });
    insertOcrTextShape(
      editor,
      { id: shape.id, parentId: shape.parentId, props: { w: shape.props.w } },
      text,
    );
  } catch (error) {
    console.error('[ocr] recognizeBoardShapeText failed', error);

    if (error instanceof OcrNoTextError) {
      toast.error(i18n.t('toast.ocrNoText', { ns: 'board' }));
      return;
    }

    if (error instanceof OcrImageLoadError) {
      toast.error(i18n.t('toast.ocrImageLoadError', { ns: 'board' }));
      return;
    }

    toast.error(i18n.t('toast.ocrFailed', { ns: 'board' }));
  } finally {
    useOcrProcessingStore.getState().finish(shapeId);
  }
}

export async function recognizeBoardImageText(
  editor: Editor,
  shapeId: DrShapeId,
  language: OcrLanguage,
  provider?: OcrProvider,
): Promise<void> {
  const shape = editor.getShape(shapeId);
  if (!shape || shape.type !== 'image') return;

  await runRecognizeOnShape(
    editor,
    shapeId,
    language,
    () => getImageBlobFromShape(editor, shape as DrImageShape),
    provider,
  );
}

export function canvasToOcrBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new OcrImageLoadError('Empty canvas'));
          return;
        }
        resolve(blob);
      }, 'image/png');
    } catch (error) {
      reject(
        error instanceof OcrImageLoadError
          ? error
          : new OcrImageLoadError('Could not read canvas pixels'),
      );
    }
  });
}

export async function recognizeBoardPdfPageText(
  editor: Editor,
  shapeId: DrShapeId,
  getPageBlob: () => Promise<Blob>,
  language: OcrLanguage,
  provider?: OcrProvider,
): Promise<void> {
  const shape = editor.getShape(shapeId);
  if (!shape || shape.type !== 'pdf') return;

  await runRecognizeOnShape(editor, shapeId, language, getPageBlob, provider);
}
