/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tldraw, TldrawProps } from 'tldraw';
import 'tldraw/tldraw.css';
import { useKeyPress } from 'common.utils';
import { Navbar, SelectionMenu } from '../toolbar';
import { useTldrawStore } from '../../../store';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import { JSX } from 'react/jsx-runtime';
import { CollaboratorCursor } from './CollaboratorCursor';
import { LoadingScreen } from 'common.ui';
import { useRemoveMark, useYjsStore } from '../../../hooks';
import { Header } from '../header';
import { useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';
import { myAssetStore } from '../../../features';

export const TldrawCanvas = (props: JSX.IntrinsicAttributes & TldrawProps) => {
  useRemoveMark();

  const { selectedElementId, selectElement } = useTldrawStore();

  const { boardId = 'empty' } = useParams({ strict: false });
  const { data } = useGetMaterial(boardId);

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });
  const { store, status, undo, redo, canUndo, canRedo } = useYjsStore({
    hostUrl: 'wss://hocus.sovlium.ru',
    roomId: data.ydoc_id,
  });

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
            <Navbar
              undo={undo ?? (() => {})}
              redo={redo ?? (() => {})}
              canUndo={canUndo ?? false}
              canRedo={canRedo ?? false}
            />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
