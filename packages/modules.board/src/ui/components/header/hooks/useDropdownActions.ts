// useBoardActions.ts
import { useParams } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
} from 'common.services';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useEditor } from '@ibodr/draw';
import type { DrRecord } from '@ibodr/draw';
import { useYjsContext } from '../../../../providers/YjsProvider';
import { useTranslation } from 'react-i18next';

type BoardSnapshotJson = {
  records?: DrRecord[];
  byId?: Record<string, DrRecord>;
};

export const useDropdownActions = () => {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const { classroomId, boardId, materialId } = useParams({ strict: false });

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getMaterial = (() => {
    if (classroomId) {
      if (isTutor) {
        return useGetClassroomMaterial;
      } else {
        return useGetClassroomMaterialStudent;
      }
    }

    return useGetMaterial;
  })();

  const materialIdValue = boardId ?? materialId;
  if (!materialIdValue) {
    throw new Error('boardId or materialId must be provided');
  }

  const { data } = getMaterial({
    classroomId: classroomId || '',
    id: materialIdValue,
  });
  const { isReadonly, toggleReadonly } = useYjsContext();

  useEffect(() => {
    editor.updateInstanceState({ isReadonly });
  }, [editor, isReadonly]);

  const saveCanvas = useCallback(async () => {
    if (!editor) return;

    try {
      toast.info(t('toast.exportStarted'));

      // Получаем все ID фигур на текущей странице
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        toast.error(t('toast.exportNoElements'));
        return;
      }

      // Экспортируем в PNG используя правильный API tldraw
      const { blob } = await editor.toImage([...shapeIds], {
        format: 'png',
        background: true,
        scale: 2,
        padding: 20,
      });

      // Создаем ссылку для скачивания с названием доски
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = data?.name ? `${data.name}.png` : `board-${Date.now()}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('toast.exportSuccess'));
    } catch (error) {
      console.error('Ошибка при экспорте доски:', error);
      toast.error(t('toast.exportError'));
    }
  }, [editor, data?.name, t]);

  const lockShapes = useCallback(
    (types?: string[]) => {
      if (!editor) return;

      const allShapes = editor.getCurrentPageShapes();
      const unlockedShapes = types
        ? allShapes.filter((shape) => !shape.isLocked && types.includes(shape.type))
        : allShapes.filter((shape) => !shape.isLocked);

      if (unlockedShapes.length === 0) {
        toast.info(t('toast.noUnlockedElements'));
        return;
      }

      editor.updateShapes(
        unlockedShapes.map((shape) => ({ id: shape.id, type: shape.type, isLocked: true })),
      );

      toast.success(t('toast.lockedCount', { count: unlockedShapes.length }));
    },
    [editor, t],
  );

  const unlockShapes = useCallback(
    (types?: string[]) => {
      if (!editor) return;

      const allShapes = editor.getCurrentPageShapes();
      const lockedShapes = types
        ? allShapes.filter((shape) => shape.isLocked && types.includes(shape.type))
        : allShapes.filter((shape) => shape.isLocked);

      if (lockedShapes.length === 0) {
        toast.info(t('toast.noLockedElements'));
        return;
      }

      editor.updateShapes(
        lockedShapes.map((shape) => ({ id: shape.id, type: shape.type, isLocked: false })),
      );

      toast.success(t('toast.unlockedCount', { count: lockedShapes.length }));
    },
    [editor, t],
  );

  const clearBoard = () => {
    if (!editor) return;

    try {
      // Получаем все ID фигур на текущей странице
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        toast.info(t('toast.boardAlreadyEmpty'));
        return;
      }

      // Удаляем все фигуры
      editor.deleteShapes([...shapeIds]);
      toast.success(t('toast.boardCleared'));
    } catch (error) {
      console.error('Ошибка при очистке доски:', error);
      toast.error(t('toast.clearError'));
    }
  };

  const importBoardFromJson = useCallback(
    async (file: File) => {
      if (!editor) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text) as BoardSnapshotJson;
        const records: DrRecord[] = Array.isArray(data)
          ? data
          : (data.records ?? (data.byId ? Object.values(data.byId) : []));

        if (records.length === 0) {
          toast.error(t('toast.importNoRecords'));
          return;
        }

        const toPut = records.filter(
          (r) => r && typeof r === 'object' && (r.typeName === 'shape' || r.typeName === 'asset'),
        );

        if (toPut.length === 0) {
          toast.error(t('toast.importNoShapes'));
          return;
        }

        editor.store.put(toPut);
        toast.success(t('toast.importSuccess', { count: toPut.length }));
      } catch (err) {
        console.error('Ошибка импорта доски из JSON:', err);
        const msg = err instanceof Error ? err.message : t('toast.importInvalidJson');
        toast.error(t('toast.importError'), { description: msg, duration: 5000 });
      }
    },
    [editor, t],
  );

  // Обработка событий от горячих клавиш
  useEffect(() => {
    const handleSaveCanvas = () => {
      saveCanvas();
    };

    const handleToggleReadonly = () => {
      toggleReadonly();
    };

    window.addEventListener('saveCanvas', handleSaveCanvas);
    window.addEventListener('toggleReadonly', handleToggleReadonly);

    return () => {
      window.removeEventListener('saveCanvas', handleSaveCanvas);
      window.removeEventListener('toggleReadonly', handleToggleReadonly);
    };
  }, [saveCanvas, toggleReadonly]);

  return {
    toggleReadonly,
    saveCanvas,
    clearBoard,
    lockShapes,
    unlockShapes,
    importBoardFromJson,
    isReadonly,
  };
};
