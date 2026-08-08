import React from 'react';
import { useNetworkStatus } from 'common.utils';
import { Close, Check, CrossCircle } from '@xipkg/icons';
import { useTranslation } from 'react-i18next';

interface NetworkIndicatorProps {
  showText?: boolean;
  className?: string;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  showText = false,
  className = '',
}) => {
  const { t } = useTranslation('commonUi');
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) {
    return null; // Не показываем индикатор, когда все хорошо
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <CrossCircle className="text-text-danger h-4 w-4" />,
        text: t('network.offline'),
        bgColor: 'bg-status-error-accent',
        textColor: 'text-text-danger',
        borderColor: 'border-border-error',
      };
    }

    if (isReconnecting) {
      return {
        icon: <Close className="text-status-warning-text h-4 w-4" />,
        text: t('network.reconnecting'),
        bgColor: 'bg-status-warning-background',
        textColor: 'text-status-warning-text',
        borderColor: 'border-status-warning-accent',
      };
    }

    return {
      icon: <Check className="text-status-success-text h-4 w-4" />,
      text: t('network.connected'),
      bgColor: 'bg-status-success-accent',
      textColor: 'text-status-success-text',
      borderColor: 'border-status-success-accent',
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
