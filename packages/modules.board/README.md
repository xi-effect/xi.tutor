# Модуль доски (Board Module)

Высокопроизводительный модуль для создания интерактивных досок с оптимизированным рендерингом и виртуализацией.

## Особенности

- 🚀 **Высокая производительность** - оптимизирован для работы с тысячами элементов
- 🎯 **Виртуализация** - рендеринг только видимых элементов
- 🎨 **Адаптивное качество** - автоматическая настройка качества рендеринга
- 📊 **Мониторинг производительности** - встроенные инструменты анализа
- 🔧 **Гибкая настройка** - множество опций оптимизации

## Быстрый старт

### Простое использование (рекомендуется)

```typescript
import { Board } from '@modules.board';

function App() {
  return (
    <div className="h-screen w-screen">
      <Board />
    </div>
  );
}
```

### Продвинутое использование

```typescript
import { CanvasWithProvider } from '@modules.board/ui/components/canvas';

function App() {
  return (
    <div className="h-screen w-screen">
      <CanvasWithProvider />
    </div>
  );
}
```

### Ручная настройка провайдеров

```typescript
import { Canvas } from '@modules.board/ui/components/canvas';
import { StageProvider } from '@modules.board/providers';

function App() {
  return (
    <div className="h-screen w-screen">
      <StageProvider>
        <Canvas />
      </StageProvider>
    </div>
  );
}
```

## Основные компоненты

### Board

Главный компонент доски с автоматической настройкой провайдеров (рекомендуется).

```typescript
import { Board } from '@modules.board';

<Board />
```

### CanvasWithProvider

Компонент Canvas с автоматически обернутым StageProvider.

```typescript
import { CanvasWithProvider } from '@modules.board/ui/components/canvas';

<CanvasWithProvider />
```

### Canvas

Базовый компонент Canvas (требует StageProvider).

```typescript
import { Canvas } from '@modules.board/ui/components/canvas';
import { StageProvider } from '@modules.board/providers';

<StageProvider>
  <Canvas />
</StageProvider>
```

### BackgroundLayer

Оптимизированный слой с сеткой и фоном.

```typescript
import { BackgroundLayer } from '@modules.board/ui/components/canvas';

<BackgroundLayer />
```

### CanvasLayer

Слой с элементами доски с виртуализацией.

```typescript
import { CanvasLayer } from '@modules.board/ui/components/canvas';

<CanvasLayer />
```

## Хуки оптимизации

### useKonvaOptimization

Хук для оптимизации Konva элементов.

```typescript
import { useKonvaOptimization } from '@modules.board/hooks';

const { cacheNode, batchDraw, optimizeImage } = useKonvaOptimization(stageRef, {
  enableCaching: true,
  enableBatchDraw: true,
  enableAdaptiveQuality: true,
});
```

### useVirtualization

Хук для виртуализации больших списков элементов.

```typescript
import { useVirtualization } from '@modules.board/hooks';

const { visibleElements, batchRender } = useVirtualization(elements, {
  viewportPadding: 300,
  enableVirtualization: elements.length > 100,
  batchSize: 30,
});
```

### useThrottle

Хук для ограничения частоты вызовов функций.

```typescript
import { useThrottle } from '@modules.board/hooks';

const throttledFunction = useThrottle(originalFunction, 16); // 60fps
```

## Настройка производительности

### Конфигурация по умолчанию

```typescript
const performanceConfig = {
  // Виртуализация
  virtualizationThreshold: 100,
  viewportPadding: 300,
  batchSize: 30,

  // Кэширование
  enableCaching: true,
  cachePadding: 50,

  // Качество рендеринга
  enableAdaptiveQuality: true,
  lowQualityThreshold: 0.3,
  mediumQualityThreshold: 0.7,

  // Throttling
  wheelThrottle: 16,
  resizeThrottle: 100,
};
```

### Адаптация под устройство

```typescript
const getDeviceOptimizations = () => {
  const isMobile = window.innerWidth < 768;
  const isLowEnd = navigator.hardwareConcurrency < 4;

  return {
    enableCaching: !isLowEnd,
    enableAdaptiveQuality: true,
    batchSize: isMobile ? 20 : 30,
    viewportPadding: isMobile ? 200 : 300,
  };
};
```

## Мониторинг производительности

### Включение монитора

Нажмите `F12` для включения монитора производительности.

### Программный доступ

```typescript
import { performanceProfiler } from '@modules.board/utils/performance';

// Подписка на метрики
performanceProfiler.subscribe((data) => {
  console.log('Performance:', data.metrics);
});

// Включение профилирования
performanceProfiler.enable();
```

## Лучшие практики

### 1. Используйте мемоизацию

```typescript
const MemoizedComponent = React.memo(Component);

const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props);
}, [props.dependency]);
```

### 2. Оптимизируйте обработчики событий

```typescript
const handleClick = useCallback(
  (event) => {
    // Обработка события
  },
  [dependencies],
);
```

### 3. Используйте виртуализацию для больших списков

```typescript
const { visibleElements } = useVirtualization(elements, {
  enableVirtualization: elements.length > 100,
});
```

### 4. Кэшируйте статичные элементы

```typescript
const { cacheNode } = useKonvaOptimization(stageRef);

useEffect(() => {
  if (node && isStatic) {
    cacheNode(node);
  }
}, [node, isStatic]);
```

## API Reference

### Store

#### useBoardStore

```typescript
const { boardElements, selectedElementId, addElement, removeElement, updateElement } =
  useBoardStore();
```

#### useUIStore

```typescript
const { scale, stagePosition, viewport, setScale, setStagePosition } = useUIStore();
```

### Hooks

#### useCanvasHandlers

```typescript
const { handleOnWheel, handleMouseDown, handleMouseMove, handleMouseUp, handleDragEnd } =
  useCanvasHandlers();
```

#### useZoom

```typescript
const { handleZoomIn, handleZoomOut, handleResetZoom } = useZoom(stageRef);
```

## Отладка

### Включение детального логирования

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Board performance:', {
    elementCount: boardElements.length,
    visibleCount: visibleElements.length,
    renderQuality,
    cacheHits,
  });
}
```

### Анализ производительности

```typescript
import { performanceProfiler } from '@modules.board/utils/performance';

// Получение метрик
const metrics = performanceProfiler.getAverageMetrics();
console.log('Average render time:', metrics.renderTime);

// Генерация отчета
const report = performanceProfiler.generateReport();
console.log('Performance report:', report);
```

## Примеры использования

### Создание кастомного элемента

```typescript
import { useKonvaOptimization } from '@modules.board/hooks';

const CustomElement = ({ element }) => {
  const { cacheNode } = useKonvaOptimization(stageRef);
  const nodeRef = useRef();

  useEffect(() => {
    if (nodeRef.current) {
      cacheNode(nodeRef.current);
    }
  }, [cacheNode]);

  return (
    <Shape
      ref={nodeRef}
      sceneFunc={(context) => {
        // Рисование элемента
      }}
      listening={false}
      perfectDrawEnabled={false}
    />
  );
};
```

### Оптимизация большого списка

```typescript
import { useVirtualization } from '@modules.board/hooks';

const LargeList = ({ items }) => {
  const { visibleItems, batchRender } = useVirtualization(items, {
    enableVirtualization: items.length > 100,
    batchSize: 20,
  });

  return (
    <div>
      {visibleItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
};
```

## Устранение неполадок

### Ошибка "useStage must be used within a StageProvider"

Эта ошибка возникает, когда компонент `Canvas` используется без `StageProvider`. Решения:

1. **Используйте компонент `Board`** (рекомендуется):

```typescript
import { Board } from '@modules.board';
<Board />
```

2. **Используйте `CanvasWithProvider`**:

```typescript
import { CanvasWithProvider } from '@modules.board/ui/components/canvas';
<CanvasWithProvider />
```

3. **Оберните вручную**:

```typescript
import { Canvas } from '@modules.board/ui/components/canvas';
import { StageProvider } from '@modules.board/providers';

<StageProvider>
  <Canvas />
</StageProvider>
```

## Лицензия

MIT
