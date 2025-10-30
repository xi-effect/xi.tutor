/* eslint-disable @typescript-eslint/ban-ts-comment */
import { LoadingScreen } from 'common.ui';
import { useKeyPress } from 'common.utils';
import { JSX } from 'react/jsx-runtime';
import { Editor, Tldraw, TldrawProps } from 'tldraw';
import { useLockedShapeSelection, useRemoveMark, useTldrawClipboard } from '../../../hooks';
import { useYjsContext } from '../../../providers/YjsProvider';
import { useTldrawStore } from '../../../store';
import { Header } from '../header';
import { Navbar, SelectionMenu } from '../toolbar';
import { CollaboratorCursor } from './CollaboratorCursor';
import { TldrawZoomPanel } from './TldrawZoomPanel';
import { useState } from 'react';
import 'tldraw/tldraw.css';
import './customstyles.css';

export const TldrawCanvas = ({
  token,
  ...props
}: JSX.IntrinsicAttributes & TldrawProps & { token: string }) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  const { selectedElementId, selectElement } = useTldrawStore();
  const { store, status, undo, redo, canUndo, canRedo } = useYjsContext();

  useRemoveMark();
  useLockedShapeSelection(editor);
  useTldrawClipboard(editor);

  useKeyPress('Backspace', () => {
    if (selectedElementId) {
      selectElement(null);
    }
  });

  if (status === 'loading') return <LoadingScreen />;

  return (
    <div id="whiteboard-container" className="flex h-full w-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <Tldraw
            onMount={(editor) => {
              setEditor(editor);
              editor.updateInstanceState({
                isGridMode: true,
                isDebugMode: false,
                isPenMode: false,
              });
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
            <Navbar undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} token={token} />
            <TldrawZoomPanel />
          </Tldraw>
        </div>
      </div>
    </div>
  );
};
