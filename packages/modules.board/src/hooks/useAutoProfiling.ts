/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { env } from 'common.env';
import { performanceProfiler } from '../utils/performance';

export const useAutoProfiling = () => {
  useEffect(() => {
    // Автоматически включаем профилирование в режиме разработки или если явно включено
    if (env.DEV || env.VITE_ENABLE_PERFORMANCE_PROFILING) {
      performanceProfiler.enable();

      // Добавляем глобальную функцию для управления профилированием
      (window as any).__BOARD_PROFILER__ = {
        enable: () => performanceProfiler.enable(),
        disable: () => performanceProfiler.disable(),
        getReport: () => {
          const report = performanceProfiler.generateReport();
          console.log(report);
          return report;
        },
        clear: () => performanceProfiler.clearMetrics(),
        getMetrics: () => performanceProfiler.getMetrics(),
        getAverageMetrics: () => performanceProfiler.getAverageMetrics(),
      };

      console.log('Board performance profiling enabled');
      console.log('Use window.__BOARD_PROFILER__ to control profiling');
    }

    return () => {
      if (env.DEV || env.VITE_ENABLE_PERFORMANCE_PROFILING) {
        delete (window as any).__BOARD_PROFILER__;
      }
    };
  }, []);
};
