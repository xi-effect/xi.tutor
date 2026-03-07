import { nanoid } from 'nanoid';
import { Editor, TLShapeId } from 'tldraw';
import { toast } from 'sonner';
import { uploadFileRequest } from 'common.services';
import {
  AUDIO_SHAPE_WIDTH,
  AUDIO_SHAPE_HEIGHT,
  type AudioShape,
  ALLOWED_AUDIO_MIME_TYPES,
  checkAudioMagicBytes,
} from '../shapes/audio';

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
    toast.error('Неподдерживаемый формат', {
      description: 'Выберите аудиофайл (MP3, OGG, WAV, AAC, FLAC и др.).',
      duration: 5000,
    });
    return;
  }

  const signatureValid = await checkAudioMagicBytes(file);
  if (!signatureValid) {
    toast.error('Неверный формат файла', {
      description: 'Содержимое файла не соответствует заявленному типу аудио.',
      duration: 5000,
    });
    return;
  }

  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    toast.error('Файл слишком большой', {
      description: `Размер аудио не должен превышать 5 MiB (сейчас ${(file.size / 1024 / 1024).toFixed(2)} MiB).`,
      duration: 5000,
    });
    return;
  }

  const existingCount = editor.getCurrentPageShapes().filter((s) => s.type === 'audio').length;

  if (existingCount >= MAX_AUDIO_SHAPES) {
    toast.error('Лимит аудиофайлов', {
      description: `На доске может быть не более ${MAX_AUDIO_SHAPES} аудиообъектов.`,
      duration: 5000,
    });
    return;
  }

  const shapeId = `shape:${nanoid()}` as TLShapeId;
  const duration = await getAudioDuration(file);
  const viewportCenter = editor.getViewportPageBounds().center;

  editor.createShapes<AudioShape>([
    {
      id: shapeId,
      type: 'audio',
      x: viewportCenter.x - AUDIO_SHAPE_WIDTH / 2,
      y: viewportCenter.y - AUDIO_SHAPE_HEIGHT / 2,
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
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить аудио';
      toast.error('Ошибка загрузки аудио', { description: msg, duration: 5000 });
      editor.deleteShapes([shapeId]);
    }
  })();
}
