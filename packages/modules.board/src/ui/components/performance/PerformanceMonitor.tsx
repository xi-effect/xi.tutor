import { useState, useEffect, useCallback } from 'react';
import { performanceProfiler, type PerformanceData } from '../../../utils/performance';
import { useBoardStore } from '../../../store';
import { useUIStore } from '../../../store';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const PerformanceMonitor = ({ isVisible = false, onToggle }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { boardElements } = useBoardStore();
  const { scale } = useUIStore();

  useEffect(() => {
    const unsubscribe = performanceProfiler.subscribe((data) => {
      setMetrics((prev) => [...prev.slice(-50), data]); // Храним последние 50 измерений
    });

    return unsubscribe;
  }, []);

  const averageMetrics = performanceProfiler.getAverageMetrics();
  const slowRenders = metrics.filter((m) => m.metrics.renderTime > 16).length;
  const totalRenders = metrics.length;

  // Определяем качество рендеринга на основе масштаба
  const getRenderQuality = () => {
    if (scale < 0.5) return { quality: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
    if (scale < 1.0) return { quality: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { quality: 'High', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const renderQuality = getRenderQuality();

  const getElementTypeCount = () => {
    const counts = {
      line: 0,
      text: 0,
      rectangle: 0,
      circle: 0,
      image: 0,
      sticker: 0,
      other: 0,
    };

    boardElements.forEach((element) => {
      if (element.type in counts) {
        counts[element.type as keyof typeof counts]++;
      } else {
        counts.other++;
      }
    });

    return counts;
  };

  const elementCounts = getElementTypeCount();

  const handleClear = useCallback(() => {
    performanceProfiler.clearMetrics();
    setMetrics([]);
  }, []);

  const handleExport = useCallback(() => {
    const report = performanceProfiler.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 min-w-80 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Performance Monitor</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            onClick={onToggle}
            className="rounded bg-gray-500 px-2 py-1 text-xs text-white hover:bg-gray-600"
          >
            Hide
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded bg-gray-100 p-2">
            <div className="font-medium">Elements</div>
            <div className="text-lg">{boardElements.length}</div>
          </div>
          <div className="rounded bg-gray-100 p-2">
            <div className="font-medium">Total Renders</div>
            <div className="text-lg">{totalRenders}</div>
          </div>
          <div className="rounded bg-gray-100 p-2">
            <div className="font-medium">Slow Renders</div>
            <div className="text-lg text-red-600">{slowRenders}</div>
          </div>
          <div className="rounded bg-gray-100 p-2">
            <div className="font-medium">Slow %</div>
            <div className="text-lg text-red-600">
              {totalRenders > 0 ? ((slowRenders / totalRenders) * 100).toFixed(1) : '0'}%
            </div>
          </div>
        </div>

        {/* Информация об оптимизациях */}
        <div className={`${renderQuality.bg} rounded p-3`}>
          <h4 className="mb-2 font-medium text-gray-800">Optimizations</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Scale:</span>
              <span className="ml-1 font-medium">{scale.toFixed(2)}x</span>
            </div>
            <div>
              <span className="text-gray-600">Quality:</span>
              <span className={`ml-1 font-medium ${renderQuality.color}`}>
                {renderQuality.quality}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Throttling:</span>
              <span className="ml-1 font-medium text-green-600">16ms (60fps)</span>
            </div>
            <div>
              <span className="text-gray-600">Visibility:</span>
              <span className="ml-1 font-medium text-green-600">
                {boardElements.length >= 50 ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Детальная информация об элементах */}
        {boardElements.length > 0 && (
          <div className="rounded bg-green-50 p-3">
            <h4 className="mb-2 font-medium text-green-800">Elements Breakdown</h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-green-700">
              {elementCounts.line > 0 && (
                <div className="flex justify-between">
                  <span>Lines:</span>
                  <span className="font-medium">{elementCounts.line}</span>
                </div>
              )}
              {elementCounts.text > 0 && (
                <div className="flex justify-between">
                  <span>Text:</span>
                  <span className="font-medium">{elementCounts.text}</span>
                </div>
              )}
              {elementCounts.rectangle > 0 && (
                <div className="flex justify-between">
                  <span>Rectangles:</span>
                  <span className="font-medium">{elementCounts.rectangle}</span>
                </div>
              )}
              {elementCounts.circle > 0 && (
                <div className="flex justify-between">
                  <span>Circles:</span>
                  <span className="font-medium">{elementCounts.circle}</span>
                </div>
              )}
              {elementCounts.image > 0 && (
                <div className="flex justify-between">
                  <span>Images:</span>
                  <span className="font-medium">{elementCounts.image}</span>
                </div>
              )}
              {elementCounts.sticker > 0 && (
                <div className="flex justify-between">
                  <span>Stickers:</span>
                  <span className="font-medium">{elementCounts.sticker}</span>
                </div>
              )}
              {elementCounts.other > 0 && (
                <div className="flex justify-between">
                  <span>Other:</span>
                  <span className="font-medium">{elementCounts.other}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {averageMetrics && (
          <div className="rounded bg-blue-50 p-3">
            <h4 className="mb-2 font-medium text-blue-800">Average Metrics</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <div>Render time: {averageMetrics.renderTime.toFixed(2)}ms</div>
              <div>Frame time: {averageMetrics.frameTime.toFixed(2)}ms</div>
              <div>Memory: {(averageMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB</div>
              <div>Sync time: {averageMetrics.syncTime.toFixed(2)}ms</div>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
              >
                Clear
              </button>
              <button
                onClick={handleExport}
                className="rounded bg-green-500 px-3 py-1 text-xs text-white hover:bg-green-600"
              >
                Export
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto">
              <h4 className="mb-2 font-medium text-gray-700">Recent Operations</h4>
              <div className="space-y-1 text-xs">
                {metrics
                  .slice(-10)
                  .reverse()
                  .map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded bg-gray-50 p-1"
                    >
                      <span className="truncate">{metric.context.action}</span>
                      <span
                        className={`font-mono ${
                          metric.metrics.renderTime > 16 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {metric.metrics.renderTime.toFixed(1)}ms
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
