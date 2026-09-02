import { nanoid } from 'nanoid';
import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { uploadFileIdRequest } from 'common.services';
import { fileTypeFromBuffer } from 'file-type';
import * as pdfjsLib from 'pdfjs-dist';
import { getFileExtension, isPdfMime } from '../constants/mimeTypes';
import { PDF_MAX_SIZE, PDF_MIN_SIZE, type PdfShape } from '../shapes/pdf';
import { resolveShapeCoordinates } from '../utils';
import { getBoardUploadErrorToast } from '../utils/boardUploadError';
import i18n from 'i18next';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_PDF_SHAPES = 50;
const DEFAULT_PDF_WIDTH = 400;
const PDF_MIME = 'application/pdf';
const DETECT_BUFFER_LENGTH = 4100;

function isPdfFile(file: File): boolean {
  return isPdfMime(file.type) || getFileExtension(file.name) === 'pdf';
}

async function sniffIsPdf(file: File): Promise<boolean> {
  try {
    const buffer = await file.slice(0, DETECT_BUFFER_LENGTH).arrayBuffer();
    const detected = await fileTypeFromBuffer(buffer);
    return isPdfMime(detected?.mime);
  } catch {
    return false;
  }
}

/** Бэкенд отвергает пустой type / octet-stream (415), типично для Android-пикеров. */
function withPdfMimeType(file: File): File {
  const name = getFileExtension(file.name) === 'pdf' ? file.name : `${file.name || 'document'}.pdf`;
  if (file.type === PDF_MIME && name === file.name) return file;
  return new File([file], name, { type: PDF_MIME, lastModified: file.lastModified });
}

export async function insertPdf(editor: Editor, file: File, token: string) {
  if (!isPdfFile(file) && !(await sniffIsPdf(file))) {
    toast.error(i18n.t('toast.unsupportedFormat', { ns: 'board' }), {
      description: i18n.t('toast.pdfFormatDesc', { ns: 'board' }),
      duration: 5000,
    });
    return;
  }

  file = withPdfMimeType(file);

  if (file.size > MAX_PDF_SIZE_BYTES) {
    toast.error(i18n.t('toast.fileTooLarge', { ns: 'board' }), {
      description: i18n.t('toast.pdfSizeDesc', {
        ns: 'board',
        size: (file.size / 1024 / 1024).toFixed(2),
      }),
      duration: 5000,
    });
    return;
  }

  const existingPdfCount = editor.getCurrentPageShapes().filter((s) => s.type === 'pdf').length;

  if (existingPdfCount >= MAX_PDF_SHAPES) {
    toast.error(i18n.t('toast.pdfLimitTitle', { ns: 'board' }), {
      description: i18n.t('toast.pdfLimitDesc', { ns: 'board', max: MAX_PDF_SHAPES }),
      duration: 5000,
    });
    return;
  }

  const shapeId = `shape:${nanoid()}` as DrShapeId;

  let totalPages = 1;
  let pageWidth = DEFAULT_PDF_WIDTH;
  let pageHeight = Math.round(DEFAULT_PDF_WIDTH * Math.SQRT2); // A4 fallback

  const objectUrl = URL.createObjectURL(file);
  try {
    const pdfDoc = await pdfjsLib.getDocument(objectUrl).promise;
    totalPages = pdfDoc.numPages;

    const firstPage = await pdfDoc.getPage(1);
    const vp = firstPage.getViewport({ scale: 1 });
    pageHeight = Math.round((DEFAULT_PDF_WIDTH / vp.width) * vp.height);
    pageWidth = DEFAULT_PDF_WIDTH;

    pdfDoc.destroy();
  } catch {
    // fall back to default dimensions
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  // Не создаём PDF меньше MIN_SIZE по меньшей стороне — иначе будет нечитаемо
  const minSide = Math.min(pageWidth, pageHeight);
  if (minSide < PDF_MIN_SIZE) {
    const scale = PDF_MIN_SIZE / minSide;
    pageWidth = Math.round(pageWidth * scale);
    pageHeight = Math.round(pageHeight * scale);
  }

  // Ограничиваем размер по большей стороне (как у изображений 4096×4096)
  const maxSide = Math.max(pageWidth, pageHeight);
  if (maxSide > PDF_MAX_SIZE) {
    const scale = PDF_MAX_SIZE / maxSide;
    pageWidth = Math.round(pageWidth * scale);
    pageHeight = Math.round(pageHeight * scale);
  }

  const coordinates = resolveShapeCoordinates(editor, pageWidth, pageHeight);

  editor.createShapes<PdfShape>([
    {
      id: shapeId,
      type: 'pdf',
      x: coordinates.x,
      y: coordinates.y,
      props: {
        src: '',
        fileName: file.name,
        totalPages,
        currentPage: 1,
        w: pageWidth,
        h: pageHeight,
        studentCanFlip: true,
        pagesVisible: 1,
      },
    },
  ]);

  editor.setSelectedShapes([shapeId]);
  Promise.resolve().then(() => {
    editor.zoomToSelection({ animation: { duration: 200 } });
  });

  // Upload in background
  (async () => {
    try {
      const serverUrl = await uploadFileIdRequest({ file, token });

      editor.updateShape<PdfShape>({
        id: shapeId,
        type: 'pdf',
        props: { src: serverUrl },
      });
    } catch (err) {
      console.error('[insertPdf] Upload failed:', err);
      const { title, description } = getBoardUploadErrorToast(err, file, MAX_PDF_SIZE_BYTES, {
        sizeDescKey: 'toast.pdfSizeDesc',
        failedTitleKey: 'toast.pdfUploadError',
        failedDescKey: 'toast.pdfUploadFailed',
        formatDescKey: 'toast.pdfFormatDesc',
      });
      toast.error(title, {
        description,
        duration: 5000,
      });
      editor.deleteShapes([shapeId]);
    }
  })();
}
