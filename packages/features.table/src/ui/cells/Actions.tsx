import { Button } from '@xipkg/button';
import { Trash } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useDeleteRecipientInvoice } from 'common.services';
import { TutorPaymentT } from 'common.types';

type ActionsCellProps = {
  invoiceId: TutorPaymentT['id'];
  classroomId?: TutorPaymentT['classroom_id'];
};

export const ActionsCell = ({ invoiceId, classroomId }: ActionsCellProps) => {
  const { mutate: deleteInvoice, isPending } = useDeleteRecipientInvoice(classroomId?.toString());

  const handleDelete = () => {
    if (confirm('Вы уверены, что хотите удалить выставленный счет?')) {
      deleteInvoice(invoiceId.toString());
    }
  };

  return (
    <div className="invisible flex flex-row items-center justify-end group-hover:visible">
      <div className="flex flex-row items-center justify-between gap-2">
        {/* <Button className="size-8 rounded-lg p-0" variant="ghost" size="s">
          <Edit className="size-4 fill-gray-100" />
        </Button> */}

        <Tooltip delayDuration={1000}>
          <TooltipTrigger asChild>
            <Button
              className="size-8 rounded-lg p-0"
              variant="ghost"
              size="s"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash className="size-4 fill-gray-100" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Удалить выставленный счет</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
