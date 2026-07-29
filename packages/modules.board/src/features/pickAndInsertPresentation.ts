import { nanoid } from 'nanoid';
import { Editor, DrShapeId } from '@ibodr/draw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';

import { init } from 'pptx-preview';
import { PresentationShape } from '../shapes/presentation';

const MAX_PRESENTATION_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_PRESENTATION_SHAPES = 20;

const DEFAULT_WIDTH = 800;

export async function insertPresentation(editor: Editor, file: File, token: string) {
  if (!file.name.toLowerCase().endsWith('.pptx')) {
    toast.error('Неподдерживаемый формат', {
      description: 'Выберите файл PPTX',
    });

    return;
  }

  if (file.size > MAX_PRESENTATION_SIZE_BYTES) {
    toast.error('Файл слишком большой', {
      description: 'Размер презентации не должен превышать 20 MiB',
    });

    return;
  }

  const count = editor.getCurrentPageShapes().filter((s) => s.type === 'presentation').length;

  if (count >= MAX_PRESENTATION_SHAPES) {
    toast.error('Лимит презентаций', {
      description: `На доске может быть не более ${MAX_PRESENTATION_SHAPES} презентаций`,
    });

    return;
  }

  const shapeId = `shape:${nanoid()}` as DrShapeId;

  let totalSlides = 1;

  const width = DEFAULT_WIDTH;

  const height = Math.round((DEFAULT_WIDTH * 9) / 16);

  const buffer = await file.arrayBuffer();

  try {
    const div = document.createElement('div');

    const previewer = init(div, {
      mode: 'slide',
      width,
      height,
    });

    await previewer.preview(buffer);

    totalSlides = previewer.slideCount;

    previewer.destroy();
  } catch (err) {
    console.error('[insertPresentation] preview failed', err);
  }

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
        totalSlides,
        currentSlide: 1,
        w: width,
        h: height,
        studentCanFlip: true,
      },
    },
  ]);

  (async () => {
    try {
      const serverUrl = await uploadFileRequest({
        file,
        token,
      });

      console.log('[insertPresentation] uploaded url:', serverUrl);

      editor.updateShape<PresentationShape>({
        id: shapeId,
        type: 'presentation',
        props: {
          src: serverUrl,
        },
      });
    } catch (err) {
      console.error('[insertPresentation] upload failed', err);

      toast.error('Ошибка загрузки презентации');

      editor.deleteShapes([shapeId]);
    }
  })();
}
