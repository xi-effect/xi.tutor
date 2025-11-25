# Модуль создания счетов на оплату (features.invoice)

Модуль предназначен для создания и отправки счетов на оплату в приложении.

## Структура модуля

```
src/
├── hooks/        - хуки для работы с формой счета и утилитарные хуки
├── model/        - схемы и вспомогательные функции для формы счета
├── types/        - типы TypeScript для модуля
├── ui/           - React-компоненты UI (InvoiceModal, InputWithHelper и др.)
├── locales/      - файлы локализации
```

## Использование

```tsx
import { InvoiceModal } from 'features.invoice';

export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Создать счет</button>
      <InvoiceModal open={open} onOpenChange={setOpen} />
    </>
  );
}
```
