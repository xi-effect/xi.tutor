import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import { ArrowUpRight, Notification } from '@xipkg/icons';

export const Payments = () => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const handleMore = () => {
    // Сохраняем параметр call при переходе к оплатам
    const filteredSearch = search.call ? { call: search.call } : {};

    navigate({
      to: '/payments',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  const handleRemind = () => {
    // TODO: Реализовать функцию напоминания об оплате
    console.log('Напомнить об оплате');
  };

  return (
    <div className="bg-gray-0 border-gray-30 flex flex-col gap-4 rounded-2xl border p-6">
      <div className="flex flex-row gap-4">
        <Button
          variant="none"
          size="s"
          className="border-gray-30 flex-1 rounded-lg border"
          onClick={handleMore}
        >
          Подробнее о финансах
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="secondary" size="s" className="flex-1 rounded-lg" onClick={handleRemind}>
          Напомнить об оплате
          <Notification className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
