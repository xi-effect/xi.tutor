import { useState } from 'react';
import { Button } from '@xipkg/button';
import { MoreVert, Payments } from '@xipkg/icons';
import { TemplateT } from 'common.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import {
  ConfirmDialog,
  cardMenuButtonClass,
  cardMenuIconClass,
  cardMenuPositionClass,
  getDateLocale,
} from 'common.ui';
import { useTranslation } from 'react-i18next';
import { ModalTemplate } from './ModalTemplate';

const formatPrice = (price: number) => `${price.toLocaleString(getDateLocale())} ₽`;

export const TemplateCard = ({
  name,
  price,
  id,
  handleDeleteTemplate,
  isDeleting = false,
}: TemplateT & {
  handleDeleteTemplate: (id: number, onSuccess?: () => void) => void;
  isDeleting?: boolean;
}) => {
  const { t } = useTranslation('payments');
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleEditTemplate = () => {
    setMenuOpen(false);
    setModalOpen(true);
  };

  const handleDeleteClick = () => {
    setMenuOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDeleteTemplate(id, () => setDeleteConfirmOpen(false));
  };

  return (
    <>
      <div
        onClick={handleEditTemplate}
        className="group bg-background-surface relative flex h-40 w-full cursor-pointer flex-col justify-between rounded-2xl p-5 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] transition-shadow duration-200 ease-linear hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.1)]"
        data-umami-event="payment-template-card-open"
      >
        <div className="flex w-full items-start">
          <div className="bg-status-info-background flex size-10 shrink-0 items-center justify-center rounded-[10px]">
            <Payments className="fill-icon-brand size-6" />
          </div>
        </div>

        <div className={cardMenuPositionClass}>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                className={cardMenuButtonClass}
                variant="none"
                size="icon"
                data-umami-event="payment-template-menu-open"
              >
                <MoreVert className={cardMenuIconClass} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              className="border-border-default bg-background-surface border p-1"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="text-text-primary hover:text-text-primary focus:text-text-primary"
                onClick={handleEditTemplate}
              >
                {t('templateCard.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-text-primary hover:text-text-primary focus:text-text-primary"
                onClick={handleDeleteClick}
              >
                {t('templateCard.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex w-full flex-col items-start gap-1 overflow-hidden">
          <p className="text-text-primary line-clamp-2 w-full text-base leading-5 font-medium">
            {name}
          </p>
          <p className="text-text-secondary w-full text-sm leading-5 font-normal">
            {formatPrice(price)}
          </p>
        </div>
      </div>

      <ModalTemplate
        isOpen={modalOpen}
        type="edit"
        name={name}
        price={price}
        id={id}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('templateCard.deleteConfirmTitle')}
        description={t('templateCard.deleteConfirmDescription', { name })}
        confirmLabel={
          isDeleting ? t('templateCard.deleting') : t('templateCard.deleteConfirmAction')
        }
        cancelLabel={t('templateCard.deleteConfirmCancel')}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
};
