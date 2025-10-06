# 📏 Высоты панелей в ВКС

## 🎯 Обзор

Система учитывает все панели интерфейса для корректного расчета доступной высоты для сетки пользователей.

## 📐 Высоты панелей

### **1. Header (modules.navigation)**

- **Файл**: `packages/modules.navigation/src/ui/Header/Header.tsx`
- **Высота**: `64px` (фиксированная)
- **CSS класс**: `h-[64px]`
- **Описание**: Верхняя панель навигации с логотипом, уведомлениями и профилем пользователя

### **2. UpBar (modules.calls)**

- **Файл**: `packages/modules.calls/src/ui/Up/UpBar.tsx`
- **Высота**: `80px` (примерная)
- **CSS классы**: `flex items-end px-4 pb-4`
- **Описание**: Панель с названием класса, кнопками возврата и полноэкранного режима
- **Особенности**: Высота может изменяться в зависимости от контента

### **3. BottomBar (modules.calls)**

- **Файл**: `packages/modules.calls/src/ui/Bottom/BottomBar.tsx`
- **Высота**: `69px` (фиксированная)
- **CSS классы**: `h-[48px]` + `p-4` (16px padding)
- **Описание**: Нижняя панель с кнопками управления (микрофон, камера, демонстрация экрана)

## 🎨 CSS переменные

```css
:root {
  /* Высоты панелей */
  --header-height: 64px; /* Header из modules.navigation */
  --upbar-height: 80px; /* UpBar из modules.calls */
  --bottom-bar-height: 69px; /* BottomBar из modules.calls */

  /* Доступная высота для сетки */
  --available-height: calc(
    100vh - var(--header-height) - var(--upbar-height) - var(--bottom-bar-height)
  );
}
```

## 📱 Адаптивные настройки

### **Мобильные устройства (≤640px)**

```css
:root {
  --header-height: 56px; /* Уменьшенная высота */
  --upbar-height: 70px; /* Компактная панель */
  --bottom-bar-height: 60px; /* Меньше отступов */
}
```

### **Планшеты (641px - 1024px)**

```css
:root {
  --upbar-height: 75px; /* Средняя высота */
}
```

### **Десктопы (≥1025px)**

```css
:root {
  --upbar-height: 80px; /* Полная высота */
}
```

## 🔧 Особые случаи

### **Полноэкранный режим**

```css
.lk-video-conference[data-fullscreen='true'] {
  --upbar-height: 0px; /* Скрываем UpBar */
}
```

### **Минимальная высота**

```css
.lk-grid-layout {
  min-height: 200px; /* Гарантированная минимальная высота */
}
```

## 📊 Итоговые расчеты

### **Обычный режим**

- **Общая высота панелей**: 64px + 80px + 69px = **213px**
- **Доступная высота**: `100vh - 213px`

### **Мобильные устройства**

- **Общая высота панелей**: 56px + 70px + 60px = **186px**
- **Доступная высота**: `100vh - 186px`

### **Полноэкранный режим**

- **Общая высота панелей**: 64px + 0px + 69px = **133px**
- **Доступная высота**: `100vh - 133px`

## 🎯 Применение

Сетка пользователей автоматически подстраивается под доступную высоту:

```css
.lk-grid-layout {
  height: var(--available-height);
  max-height: var(--available-height);
  overflow: hidden;
}
```

## 🔍 Отладка

Для проверки высот можно использовать браузерные инструменты разработчика:

```javascript
// Проверка высот панелей
console.log('Header:', document.querySelector('.header')?.offsetHeight);
console.log('UpBar:', document.querySelector('.upbar')?.offsetHeight);
console.log('BottomBar:', document.querySelector('.bottombar')?.offsetHeight);
console.log(
  'Available height:',
  getComputedStyle(document.documentElement).getPropertyValue('--available-height'),
);
```

## ✅ Результат

Теперь сетка пользователей корректно помещается в доступном пространстве между всеми панелями интерфейса! 🚀
