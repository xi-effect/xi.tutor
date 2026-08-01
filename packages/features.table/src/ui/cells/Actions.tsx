import { useState } from 'react';
import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { ConfirmDialog } from 'common.ui';
import { useDeleteRecipientInvoice } from 'common.services';
import { TutorPaymentT } from 'common.types';
import { useTranslation } from 'react-i18next';

type ActionsCellProps = {
  invoiceId: TutorPaymentT['id'];
  classroomId?: TutorPaymentT['classroom_id'];
};

export const ActionsCell = ({ invoiceId, classroomId }: ActionsCellProps) => {
  const { t } = useTranslation('paymentsTable');
  const { mutate: deleteInvoice, isPending } = useDeleteRecipientInvoice(classroomId?.toString());
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmDelete = () => {
    deleteInvoice(invoiceId.toString(), {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <div className="invisible flex flex-row items-center justify-end group-hover:visible">
        <div className="flex flex-row items-center justify-between gap-2">
          <Tooltip delayDuration={1000}>
            <TooltipTrigger asChild>
              <Button
                className="size-8 rounded-lg p-0"
                variant="none"
                size="s"
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
                data-umami-event="invoice-delete"
                data-umami-event-invoice-id={invoiceId}
              >
                <Trash className="fill-icon-primary size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{t('deleteTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDescription')}
        confirmLabel={isPending ? t('deleting') : t('deleteConfirmAction')}
        cancelLabel={t('deleteConfirmCancel')}
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </>
  );
};
