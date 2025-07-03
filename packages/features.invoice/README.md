# Модуль ВКС (видеоконференцсвязь)

Модуль предназначен для реализации видеозвонков в приложении.

## Структура модуля

```
src/
├── hooks/        - хуки для работы с LiveKit и другие утилитарные хуки
├── providers/    - провайдеры React Context
├── store/        - хранилище состояния (Zustand)
├── types/        - типы TypeScript
├── ui/           - React компоненты UI
└── utils/        - утилитарные функции и константы
```

## Использование

```tsx
import { Call } from 'modules.calls';

export default function Page() {
  return <Call />;
}
```
