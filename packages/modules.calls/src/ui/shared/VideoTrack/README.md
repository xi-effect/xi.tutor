# VideoTrack Security Components

Этот модуль предоставляет компоненты для полной блокировки браузерных элементов управления видео в ВКС.

## Компоненты

### VideoTrack

Кастомная обертка над `VideoTrack` из `@livekit/components-react` с полной блокировкой браузерных элементов управления.

### SecureVideo

Безопасная обертка над нативным `<video>` элементом с теми же функциями блокировки.

## Функции блокировки

### JavaScript блокировка

- Контекстное меню (правый клик)
- Drag & Drop
- Выделение текста
- Копирование (Ctrl+C)
- Сохранение (Ctrl+S)
- Печать (Ctrl+P)
- Dev Tools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)

### HTML атрибуты

- `disablePictureInPicture` - блокирует Picture-in-Picture
- `disableRemotePlayback` - блокирует Remote Playback
- `controls={false}` - убирает встроенные controls
- `controlsList="nodownload nofullscreen noremoteplayback"` - блокирует дополнительные элементы

### CSS стили

- `user-select: none` - блокирует выделение
- `-webkit-user-drag: none` - блокирует перетаскивание
- `-webkit-touch-callout: none` - блокирует контекстное меню на мобильных
- Скрытие всех webkit media controls

## Использование

### VideoTrack (для LiveKit компонентов)

```tsx
import { VideoTrack } from '../shared';

<VideoTrack
  trackRef={trackReference}
  className="h-full w-full"
  style={{ transform: 'rotateY(180deg)' }}
/>;
```

### SecureVideo (для нативных video элементов)

```tsx
import { SecureVideo } from '../shared';

<SecureVideo
  ref={videoRef}
  className="h-full w-full object-cover"
  playsInline
  muted
  style={{ opacity: 1 }}
/>;
```

## Глобальная защита

### useVideoSecurity хук

Применяет защиту ко всему контейнеру ВКС:

```tsx
import { useVideoSecurity } from '../hooks';

const Call = () => {
  useVideoSecurity(); // Блокирует контекстное меню для всего контейнера
  // ...
};
```

### CSS стили

Импортируйте `video-security.css` для глобальных стилей:

```tsx
import '../shared/VideoTrack/video-security.css';
```

## Применение

Все компоненты уже интегрированы в модуль calls:

- `CompactCall` использует `VideoTrack`
- `ParticipantTile` использует `VideoTrack`
- `UserTile` использует `SecureVideo`
- `Call` компонент использует `useVideoSecurity` хук и CSS стили

## Безопасность

Эти компоненты обеспечивают максимальную защиту от:

- Сохранения видео через браузер
- Копирования видео
- Открытия в Picture-in-Picture
- Использования браузерных элементов управления
- Доступа к dev tools для извлечения видео

**Примечание**: Полная защита от извлечения видео невозможна на клиентской стороне, но эти меры значительно усложняют процесс для обычных пользователей.
