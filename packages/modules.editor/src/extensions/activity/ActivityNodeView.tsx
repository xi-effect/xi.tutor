import { useMemo, useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import {
  ActivityDocument,
  useActivityDocumentRole,
  type ActivityDocumentValue,
} from 'modules.board/activities';
import { useYjsContext } from '../../hooks';
import { readActivityNode, serializeActivityNode } from './activityAttrs';

export function ActivityNodeView({ node, editor, updateAttributes }: NodeViewProps) {
  const { storageToken, isReadOnly } = useYjsContext();
  const { canEdit, isTutor } = useActivityDocumentRole(isReadOnly);
  const persisted = useMemo(() => readActivityNode(node), [node]);
  const [local, setLocal] = useState<ActivityDocumentValue | null>(null);
  const value = editor.isEditable ? persisted : (local ?? persisted);

  return (
    <NodeViewWrapper className="my-3 block w-full" contentEditable={false} data-type="activity">
      <ActivityDocument
        value={value}
        token={storageToken}
        canEdit={canEdit}
        isTutor={Boolean(isTutor)}
        onChange={(patch) => {
          const next = { ...value, ...patch };
          if (editor.isEditable) {
            updateAttributes(serializeActivityNode(next));
            setLocal(null);
            return;
          }
          setLocal(next);
        }}
      />
    </NodeViewWrapper>
  );
}
