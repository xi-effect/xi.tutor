import React from 'react';
import { useBoardStore } from '../../../store';

interface ElementsCounterProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showDetails?: boolean;
}

export const ElementsCounter: React.FC<ElementsCounterProps> = ({
  position = 'top-right',
  showDetails = false,
}) => {
  const { boardElements } = useBoardStore();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

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

  return (
    <div className={`fixed z-40 ${getPositionClasses()}`}>
      <div className="border-gray-10 bg-gray-0 rounded-xl border p-3 shadow-lg">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700">Элементы:</span>
          <span className="text-brand-600 text-lg font-bold">{boardElements.length}</span>
        </div>

        {showDetails && boardElements.length > 0 && (
          <div className="mt-2 border-t border-gray-200 pt-2">
            <div className="space-y-1 text-xs text-gray-600">
              {elementCounts.line > 0 && (
                <div className="flex justify-between">
                  <span>Линии:</span>
                  <span className="font-medium">{elementCounts.line}</span>
                </div>
              )}
              {elementCounts.text > 0 && (
                <div className="flex justify-between">
                  <span>Текст:</span>
                  <span className="font-medium">{elementCounts.text}</span>
                </div>
              )}
              {elementCounts.rectangle > 0 && (
                <div className="flex justify-between">
                  <span>Прямоугольники:</span>
                  <span className="font-medium">{elementCounts.rectangle}</span>
                </div>
              )}
              {elementCounts.circle > 0 && (
                <div className="flex justify-between">
                  <span>Круги:</span>
                  <span className="font-medium">{elementCounts.circle}</span>
                </div>
              )}
              {elementCounts.image > 0 && (
                <div className="flex justify-between">
                  <span>Изображения:</span>
                  <span className="font-medium">{elementCounts.image}</span>
                </div>
              )}
              {elementCounts.sticker > 0 && (
                <div className="flex justify-between">
                  <span>Стикеры:</span>
                  <span className="font-medium">{elementCounts.sticker}</span>
                </div>
              )}
              {elementCounts.other > 0 && (
                <div className="flex justify-between">
                  <span>Другие:</span>
                  <span className="font-medium">{elementCounts.other}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
