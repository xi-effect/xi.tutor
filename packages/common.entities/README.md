# Common Entities

Пакет содержит общие сущности, типы и утилиты, которые переиспользуются между различными частями проекта.

## Структура

- **education.ts** - типы и утилиты для работы со статусами образования
  - `StatusEducationT` - тип статуса образования
  - `TypeEducationT` - тип образования (индивидуальное/групповое)
  - `SubjectT` - тип предмета
  - `EDUCATION_STATUS_LABELS` - основной словарь переводов статусов (для студентов)
  - `EDUCATION_STATUS_LABELS_STUDENT` - словарь переводов для студентов
  - `EDUCATION_STATUS_LABELS_TUTOR` - словарь переводов для преподавателей
  - `educationUtils` - утилитарные функции для работы со статусами

## Использование

```typescript
import { StatusEducationT, EDUCATION_STATUS_LABELS, educationUtils } from 'common.entities';

// Получение текста статуса
const statusText = educationUtils.getStatusText('active'); // 'Учится'

// Получение текста статуса с учетом роли пользователя
const statusTextByRole = educationUtils.getStatusTextByRole('active', true); // 'Учусь' для преподавателя
const statusTextByRole2 = educationUtils.getStatusTextByRole('active', false); // 'Учится' для студента

// Проверка валидности статуса
const isValid = educationUtils.isValidStatus('active'); // true
```
