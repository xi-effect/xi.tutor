import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RenderElementProps } from 'slate-react';

import { useInterfaceStore } from '../../store/interfaceStore';
import { CellControls } from './CellControls';

interface SortableElementProps extends RenderElementProps {
  renderElement: (props: RenderElementProps) => JSX.Element;
}

/**
 * Компонент для создания сортируемого элемента в редакторе
 * с возможностью перетаскивания для изменения порядка
 */
export const SortableElement = ({
  attributes,
  children,
  element,
  renderElement,
}: SortableElementProps) => {
  const { activeCellControls, setActiveCellControls } = useInterfaceStore();
  const isActive = activeCellControls === element.id;

  const {
    attributes: sortableAttributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: element.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleMouseEnter = () => {
    if (activeCellControls === null) {
      setActiveCellControls(element.id);
    }
  };

  const handleMouseLeave = () => {
    if (activeCellControls === element.id) {
      setActiveCellControls(null);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...sortableAttributes}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative"
    >
      {isActive && (
        <CellControls listeners={listeners} nodeId={element.id} nodeType={element.type} />
      )}
      {renderElement({ attributes, children, element })}
    </div>
  );
};
