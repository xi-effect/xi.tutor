import { track, useEditor } from 'tldraw';
import { Plus, Minus } from '@xipkg/icons';
import { Button } from '@xipkg/button';

export const TldrawZoomPanel = track(() => {
  const editor = useEditor();

  if (!editor) return null;

  // Получаем текущий уровень зума и переводим в проценты
  const zoomLevel = editor.getZoomLevel();
  const zoomPercent = Math.round(zoomLevel * 100);

  const handleZoomIn = () => {
    editor.zoomIn(editor.getViewportScreenCenter(), { animation: { duration: 200 } });
  };

  const handleZoomOut = () => {
    editor.zoomOut(editor.getViewportScreenCenter(), { animation: { duration: 200 } });
  };

  const handleResetZoom = () => {
    editor.resetZoom(editor.getViewportScreenCenter(), { animation: { duration: 200 } });
  };

  return (
    <div className="absolute right-4 bottom-4 z-30">
      <div className="bg-gray-0 border-gray-10 flex items-center justify-center gap-2 rounded-xl border p-1 lg:rounded-2xl">
        <Button
          className="hover:bg-brand-0 pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4 fill-gray-100 lg:h-6 lg:w-6" />
        </Button>
        <Button
          className="h-6 w-6 min-w-[60px] items-center justify-center px-2 py-1 hover:bg-transparent focus:bg-transparent active:bg-transparent lg:h-8 lg:w-8"
          variant="none"
          onClick={handleResetZoom}
        >
          {zoomPercent < 1 ? '< 1%' : `${zoomPercent}%`}
        </Button>
        <Button
          className="hover:bg-brand-0 pointer-events-auto flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
          variant="none"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4 lg:h-6 lg:w-6" />
        </Button>
      </div>
    </div>
  );
});
