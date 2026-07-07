import { useEffect, useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { Input } from '@xipkg/input';
import { Textarea } from '@xipkg/textarea';
import { Trash } from '@xipkg/icons';
import { modalTitleClass } from 'common.ui';
import { useBoardModalPortal } from '../../ui/components/shared/useBoardModalPortal';
import type { KanbanCard, KanbanColumn } from './KanbanShape';
import {
  KANBAN_LABEL_COLORS,
  createLabel,
  deleteCardFromColumns,
  updateCardInColumns,
} from './kanbanHelpers';
import { useKanbanUiStore } from './kanbanUiStore';

type KanbanCardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columnId: string;
  card: KanbanCard;
  columns: KanbanColumn[];
  onSave: (columns: KanbanColumn[]) => void;
};

export function KanbanCardModal({
  open,
  onOpenChange,
  columnId,
  card,
  columns,
  onSave,
}: KanbanCardModalProps) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [labels, setLabels] = useState(card.labels);
  const [newLabelText, setNewLabelText] = useState('');
  const { portalReady, portalContainer } = useBoardModalPortal();
  const setCardModalOpen = useKanbanUiStore((state) => state.setCardModalOpen);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setLabels(card.labels);
    setNewLabelText('');
  }, [card]);

  useEffect(() => {
    setCardModalOpen(open);
    return () => setCardModalOpen(false);
  }, [open, setCardModalOpen]);

  const handleSave = () => {
    onSave(
      updateCardInColumns(columns, columnId, card.id, {
        title: title.trim() || 'Без названия',
        description: description.trim(),
        labels,
      }),
    );
    onOpenChange(false);
  };

  const handleDelete = () => {
    onSave(deleteCardFromColumns(columns, columnId, card.id));
    onOpenChange(false);
  };

  const handleAddLabel = () => {
    const text = newLabelText.trim();
    if (!text) return;
    const colorPreset = KANBAN_LABEL_COLORS[labels.length % KANBAN_LABEL_COLORS.length];
    setLabels([...labels, createLabel(text, colorPreset.value)]);
    setNewLabelText('');
  };

  if (!portalReady) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        className="relative w-full max-w-[520px]"
        portalProps={{ container: portalContainer ?? undefined }}
        aria-describedby={undefined}
      >
        <ModalHeader className="px-6 pt-6 pb-4">
          <ModalTitle className={modalTitleClass}>Карточка</ModalTitle>
          <ModalCloseButton />
        </ModalHeader>

        <ModalBody className="flex flex-col gap-4 px-6 pt-0 pb-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-60 text-sm">Название</label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Название карточки"
              onPointerDown={(event) => event.stopPropagation()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-60 text-sm">Описание</label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Подробное описание задачи"
              className="min-h-[120px] resize-y"
              onPointerDown={(event) => event.stopPropagation()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-60 text-sm">Метки</label>
            {labels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    type="button"
                    className="rounded px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: label.color }}
                    onClick={() => setLabels(labels.filter((item) => item.id !== label.id))}
                    onPointerDown={(event) => event.stopPropagation()}
                  >
                    {label.text} ×
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
              <Input
                value={newLabelText}
                onChange={(event) => setNewLabelText(event.target.value)}
                placeholder="Новая метка"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleAddLabel();
                  }
                }}
                onPointerDown={(event) => event.stopPropagation()}
              />
              <Button type="button" variant="secondary" onClick={handleAddLabel}>
                Добавить
              </Button>
            </div>
          </div>
        </ModalBody>

        <ModalFooter className="flex items-center justify-between gap-3 px-6 pb-6">
          <Button type="button" variant="ghost" onClick={handleDelete}>
            <Trash className="mr-2 size-4" />
            Удалить
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
