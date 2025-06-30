import { useCallback } from 'react';

// Расширение типа Performance для поддержки memory API (Chrome)
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export interface PerformanceMetrics {
  renderTime: number;
  frameTime: number;
  memoryUsage: number;
  elementCount: number;
  eventCount: number;
  syncTime: number;
}

export interface PerformanceData {
  timestamp: number;
  metrics: PerformanceMetrics;
  context: {
    action: string;
    elementType?: string;
    scale?: number;
    isCollaborative?: boolean;
  };
}

class PerformanceProfiler {
  private metrics: PerformanceData[] = [];
  private isEnabled = false;
  private observers: ((data: PerformanceData) => void)[] = [];

  enable() {
    this.isEnabled = true;
    console.log('Performance profiling enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('Performance profiling disabled');
  }

  isProfilingEnabled() {
    return this.isEnabled;
  }

  measureRender(action: string, fn: () => void, context?: Partial<PerformanceData['context']>) {
    if (!this.isEnabled) {
      fn();
      return;
    }

    const startTime = performance.now();
    const startMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
    const startFrame = performance.now();

    fn();

    const endTime = performance.now();
    const endMemory = (performance as PerformanceWithMemory).memory?.usedJSHeapSize || 0;
    const endFrame = performance.now();

    const metrics: PerformanceMetrics = {
      renderTime: endTime - startTime,
      frameTime: endFrame - startFrame,
      memoryUsage: endMemory - startMemory,
      elementCount: 0, // Будет заполнено позже
      eventCount: 0, // Будет заполнено позже
      syncTime: 0, // Будет заполнено позже
    };

    const data: PerformanceData = {
      timestamp: Date.now(),
      metrics,
      context: {
        action,
        ...context,
      },
    };

    this.metrics.push(data);
    this.notifyObservers(data);

    // Логируем медленные операции
    if (metrics.renderTime > 16) {
      // Больше 16ms (60fps)
      console.warn(
        `Slow render detected: ${metrics.renderTime.toFixed(2)}ms for action: ${action}`,
      );
    }
  }

  measureAsync<T>(
    action: string,
    fn: () => Promise<T>,
    context?: Partial<PerformanceData['context']>,
  ): Promise<T> {
    if (!this.isEnabled) {
      return fn();
    }

    const startTime = performance.now();

    return fn().finally(() => {
      const endTime = performance.now();
      const metrics: PerformanceMetrics = {
        renderTime: endTime - startTime,
        frameTime: 0,
        memoryUsage: 0,
        elementCount: 0,
        eventCount: 0,
        syncTime: endTime - startTime,
      };

      const data: PerformanceData = {
        timestamp: Date.now(),
        metrics,
        context: {
          action,
          ...context,
        },
      };

      this.metrics.push(data);
      this.notifyObservers(data);
    });
  }

  updateMetrics(
    updates: Partial<PerformanceMetrics>,
    context?: Partial<PerformanceData['context']>,
  ) {
    if (!this.isEnabled) return;

    const data: PerformanceData = {
      timestamp: Date.now(),
      metrics: {
        renderTime: 0,
        frameTime: 0,
        memoryUsage: 0,
        elementCount: 0,
        eventCount: 0,
        syncTime: 0,
        ...updates,
      },
      context: {
        action: 'metrics_update',
        ...context,
      },
    };

    this.metrics.push(data);
    this.notifyObservers(data);
  }

  getMetrics() {
    return this.metrics;
  }

  getMetricsByAction(action: string) {
    return this.metrics.filter((m) => m.context.action === action);
  }

  getAverageMetrics() {
    if (this.metrics.length === 0) return null;

    const totals = this.metrics.reduce(
      (acc, data) => ({
        renderTime: acc.renderTime + data.metrics.renderTime,
        frameTime: acc.frameTime + data.metrics.frameTime,
        memoryUsage: acc.memoryUsage + data.metrics.memoryUsage,
        elementCount: acc.elementCount + data.metrics.elementCount,
        eventCount: acc.eventCount + data.metrics.eventCount,
        syncTime: acc.syncTime + data.metrics.syncTime,
      }),
      {
        renderTime: 0,
        frameTime: 0,
        memoryUsage: 0,
        elementCount: 0,
        eventCount: 0,
        syncTime: 0,
      },
    );

    const count = this.metrics.length;
    return {
      renderTime: totals.renderTime / count,
      frameTime: totals.frameTime / count,
      memoryUsage: totals.memoryUsage / count,
      elementCount: totals.elementCount / count,
      eventCount: totals.eventCount / count,
      syncTime: totals.syncTime / count,
    };
  }

  clearMetrics() {
    this.metrics = [];
  }

  subscribe(callback: (data: PerformanceData) => void) {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  private notifyObservers(data: PerformanceData) {
    this.observers.forEach((callback) => callback(data));
  }

  generateReport() {
    const average = this.getAverageMetrics();
    if (!average) return 'No metrics available';

    const slowRenders = this.metrics.filter((m) => m.metrics.renderTime > 16).length;
    const totalRenders = this.metrics.length;

    return `
Performance Report:
==================
Total measurements: ${totalRenders}
Slow renders (>16ms): ${slowRenders} (${((slowRenders / totalRenders) * 100).toFixed(1)}%)

Average metrics:
- Render time: ${average.renderTime.toFixed(2)}ms
- Frame time: ${average.frameTime.toFixed(2)}ms
- Memory usage: ${(average.memoryUsage / 1024 / 1024).toFixed(2)}MB
- Element count: ${average.elementCount.toFixed(0)}
- Event count: ${average.eventCount.toFixed(0)}
- Sync time: ${average.syncTime.toFixed(2)}ms

Top slow operations:
${this.metrics
  .filter((m) => m.metrics.renderTime > 16)
  .sort((a, b) => b.metrics.renderTime - a.metrics.renderTime)
  .slice(0, 5)
  .map((m) => `- ${m.context.action}: ${m.metrics.renderTime.toFixed(2)}ms`)
  .join('\n')}
    `;
  }
}

export const performanceProfiler = new PerformanceProfiler();

// Хук для использования профилирования в компонентах
export const usePerformanceProfiler = () => {
  const measureRender = useCallback(
    (action: string, fn: () => void, context?: Partial<PerformanceData['context']>) => {
      performanceProfiler.measureRender(action, fn, context);
    },
    [],
  );

  const measureAsync = useCallback(
    <T>(action: string, fn: () => Promise<T>, context?: Partial<PerformanceData['context']>) => {
      return performanceProfiler.measureAsync(action, fn, context);
    },
    [],
  );

  const updateMetrics = useCallback(
    (updates: Partial<PerformanceMetrics>, context?: Partial<PerformanceData['context']>) => {
      performanceProfiler.updateMetrics(updates, context);
    },
    [],
  );

  return {
    measureRender,
    measureAsync,
    updateMetrics,
    isEnabled: performanceProfiler.isProfilingEnabled(),
    enable: performanceProfiler.enable.bind(performanceProfiler),
    disable: performanceProfiler.disable.bind(performanceProfiler),
    getReport: performanceProfiler.generateReport.bind(performanceProfiler),
  };
};
