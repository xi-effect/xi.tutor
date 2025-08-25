import React from 'react';
import { useNetworkStatus } from 'common.utils';
import { Close, Check, CrossCircle } from '@xipkg/icons';

interface NetworkIndicatorProps {
  showText?: boolean;
  className?: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  showText = false,
  className = '',
}) => {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) {
    return null; // Не показываем индикатор, когда все хорошо
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <CrossCircle className="h-4 w-4 text-red-500" />,
        text: 'Нет соединения',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-200',
      };
    }

    if (isReconnecting) {
      return {
        icon: <Close className="h-4 w-4 text-yellow-500" />,
        text: 'Проверка соединения...',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-200',
      };
    }

    return {
      icon: <Check className="h-4 w-4 text-green-500" />,
      text: 'Подключено',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm ${statusInfo.bgColor} ${statusInfo.textColor} ${statusInfo.borderColor} ${className} `}
    >
      {statusInfo.icon}
      {showText && <span className="text-sm font-medium">{statusInfo.text}</span>}
    </div>
  );
};
