import { Button } from '@xipkg/button';
import { useState } from 'react';
import { InvoiceModal } from 'features.invoice';

export const Header = () => {
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  return (
    <div className="flex flex-row items-center pt-1 pr-4">
      <h1 className="text-2xl font-semibold text-gray-100">Контроль оплат</h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <Button
          size="s"
          className="text-s-base text-gray-0 rounded-lg px-4 py-2 font-medium max-[550px]:hidden"
          onClick={() => setIsInvoiceModalOpen(true)}
        >
          Создать счёт на оплату
        </Button>
      </div>
      <InvoiceModal open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen} />
    </div>
  );
};
