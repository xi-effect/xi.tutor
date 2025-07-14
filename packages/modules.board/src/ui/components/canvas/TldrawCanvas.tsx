import { Tldraw, TldrawProps } from 'tldraw';
import 'tldraw/tldraw.css';
import { useKeyPress } from 'common.utils';
import { SelectedElementToolbar, Navbar } from '../toolbar';
import { useTldrawStore } from '../../../store';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import { JSX } from 'react/jsx-runtime';
import { useYjsStore } from '../../../hooks/useYjsStore';

export const TldrawCanvas = (props: JSX.IntrinsicAttributes & TldrawProps) => {
  const { selectedElementId, selectElement } = useTldrawStore();

  // const { cursor, mouseHandlers } = useCursor('select'); // Используем select как дефолтный курсор

  // useWhiteboardCollaborative({ roomId: 'test/slate-yjs-demo' });

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });
  const { store, status } = useYjsStore({
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
              console.log('[TldrawCanvas] Tldraw mounted');
              console.log('[TldrawCanvas] Editor store:', editor.store);
              console.log('[TldrawCanvas] Props store:', props.store);
              console.log('[TldrawCanvas] Stores are same:', editor.store === props.store);

              editor.store.listen(
                (update) => {
                  console.log('update', update);
                },
                { scope: 'document', source: 'user' },
              );

              editor.updateInstanceState({ isGridMode: true });
            }}
            store={store}
            hideUi
            {...props}
          >
            <Navbar />
            <SelectedElementToolbar />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
