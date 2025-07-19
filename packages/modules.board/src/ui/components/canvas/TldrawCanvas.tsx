import { Tldraw, TldrawProps } from 'tldraw';
import 'tldraw/tldraw.css';
import { useKeyPress } from 'common.utils';
import { SelectedElementToolbar, Navbar } from '../toolbar';
import { useTldrawStore } from '../../../store';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import { JSX } from 'react/jsx-runtime';
import { useYjsStore } from '../../../hooks/useYjsStore';
import { CollaboratorCursor } from './CollaboratorCursor';
import { LoadingScreen } from 'common.ui';

export const TldrawCanvas = (props: JSX.IntrinsicAttributes & TldrawProps) => {
  const { selectedElementId, selectElement } = useTldrawStore();

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });
  const { store, status, undo, redo, canUndo, canRedo } = useYjsStore({
    hostUrl: 'wss://hocus.xieffect.ru',
    roomId: 'test/demo-room',
  });

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Tldraw
            onMount={(editor) => {
              editor.updateInstanceState({ isGridMode: true });
            }}
            store={store}
            hideUi
            components={{
              CollaboratorCursor: CollaboratorCursor,
            }}
            {...props}
          >
            <Navbar
              undo={undo ?? (() => {})}
              redo={redo ?? (() => {})}
              canUndo={canUndo ?? false}
              canRedo={canRedo ?? false}
            />
            <SelectedElementToolbar />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
