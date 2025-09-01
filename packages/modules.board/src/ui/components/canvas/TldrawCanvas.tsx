/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LoadingScreen } from 'common.ui';
import { useKeyPress } from 'common.utils';
import { JSX } from 'react/jsx-runtime';
import { Tldraw, TldrawProps } from 'tldraw';
import 'tldraw/tldraw.css';
import { myAssetStore } from '../../../features';
import { useRemoveMark } from '../../../hooks';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useTldrawStore } from '../../../store';
import { Header } from '../header';
import { Navbar, SelectionMenu } from '../toolbar';
import { CollaboratorCursor } from './CollaboratorCursor';
import { TldrawZoomPanel } from './TldrawZoomPanel';

export const TldrawCanvas = (props: JSX.IntrinsicAttributes & TldrawProps) => {
  useRemoveMark();

  const { selectedElementId, selectElement } = useTldrawStore();

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });
  const { store, status, undo, redo, canUndo, canRedo } = useYjsContext();

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div id="whiteboard-container" className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Tldraw
            // @ts-ignore
            assets={myAssetStore}
            onMount={(editor) => {
              editor.updateInstanceState({ isGridMode: true });
            }}
            store={store}
            hideUi
            components={{
              CollaboratorCursor: CollaboratorCursor,
              InFrontOfTheCanvas: SelectionMenu,
            }}
            {...props}
          >
            <Header />
            <Navbar undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
