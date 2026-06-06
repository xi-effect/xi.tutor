import { PlainTextLabel, type PlainTextLabelProps, useEditor, useValue } from '@ibodr/draw';
import { EmptyLabelCaret } from './EmptyLabelCaret';
import { startLabelEditing } from './startLabelEditing';

export const BoardPlainTextLabel = (props: PlainTextLabelProps) => {
  const editor = useEditor();
  const isEditing = useValue('isEditing', () => editor.getEditingShapeId() === props.shapeId, [
    editor,
    props.shapeId,
  ]);
  const isEmpty = (props.text?.trim() ?? '') === '';

  const startEditing = () => {
    startLabelEditing(editor, props.shapeId);
  };

  if (!isEditing && isEmpty && props.isSelected) {
    return (
      <EmptyLabelCaret
        fontFamily={props.fontFamily}
        fontSize={props.fontSize}
        lineHeight={props.lineHeight}
        labelColor={props.labelColor}
        textAlign={props.textAlign}
        verticalAlign={props.verticalAlign}
        padding={props.padding}
        style={props.style}
        onActivate={startEditing}
      />
    );
  }

  return <PlainTextLabel {...props} />;
};
