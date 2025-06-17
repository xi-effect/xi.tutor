import { nanoid } from 'nanoid';
import { BoardElement, ToolType } from '../../../types';

type StartNewTextEditingArgs = {
  pos: { x: number; y: number };
  addElement: (el: BoardElement) => void;
  setEditingElementId: (id: string) => void;
  setSelectedTool: (tool: ToolType) => void;
};

export const startNewTextEditing = ({
  pos,
  addElement,
  setEditingElementId,
  setSelectedTool,
}: StartNewTextEditingArgs) => {
  const id = `text-${nanoid()}`;
  const newTextElement: BoardElement = {
    id,
    type: 'text',
    text: '',
    x: pos.x,
    y: pos.y,
    fontSize: 18,
    scaleX: 1,
    scaleY: 1,
  };

  addElement(newTextElement);
  setEditingElementId(id);
  setSelectedTool('select');
};
