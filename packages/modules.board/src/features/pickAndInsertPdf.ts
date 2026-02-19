import { nanoid } from 'nanoid';
import { Editor, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';
import * as pdfjsLib from 'pdfjs-dist';
import type { PdfShape } from '../shapes/pdf';

const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MiB
const MAX_PDF_SHAPES = 50;
const DEFAULT_PDF_WIDTH = 400;

export async function insertPdf(editor: Editor, file: File, token: string) {
  if (file.type !== 'application/pdf') {
    toast.error('Неподдерживаемый формат', {
      description: 'Выберите файл в формате PDF.',
      duration: 5000,
    });
    return;
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    toast.error('Файл слишком большой', {
      description: `Размер PDF не должен превышать 5 MiB (сейчас ${(file.size / 1024 / 1024).toFixed(2)} MiB).`,
      duration: 5000,
    });
    return;
  }

  const existingPdfCount = editor.getCurrentPageShapes().filter((s) => s.type === 'pdf').length;

  if (existingPdfCount >= MAX_PDF_SHAPES) {
    toast.error('Лимит PDF-файлов', {
      description: `На доске может быть не более ${MAX_PDF_SHAPES} PDF-объектов.`,
      duration: 5000,
    });
    return;
  }

  const shapeId = `shape:${nanoid()}` as TLShapeId;

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

  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createShapes<PdfShape>([
    {
      id: shapeId,
      type: 'pdf',
      x: viewportCenter.x - pageWidth / 2,
      y: viewportCenter.y - pageHeight / 2,
      props: {
        src: '',
        fileName: file.name,
        totalPages,
        currentPage: 1,
        w: pageWidth,
        h: pageHeight,
        studentCanFlip: true,
      },
    },
  ]);

  // Upload in background
  (async () => {
    try {
      const serverUrl = await uploadFileRequest({ file, token });

      editor.updateShape<PdfShape>({
        id: shapeId,
        type: 'pdf',
        props: { src: serverUrl },
      });
    } catch (err) {
      console.error('[insertPdf] Upload failed:', err);
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить PDF';
      toast.error('Ошибка загрузки PDF', { description: msg, duration: 5000 });
      editor.deleteShapes([shapeId]);
    }
  })();
}
