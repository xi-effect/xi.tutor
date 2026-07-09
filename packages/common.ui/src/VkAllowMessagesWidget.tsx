import { useEffect } from 'react';
import {
  clearVkAllowMessagesWidget,
  renderVkAllowMessagesWidget,
  VK_ALLOW_MESSAGES_WIDGET_ELEMENT_ID,
} from 'common.services';

type VkAllowMessagesWidgetProps = {
  communityId: number;
  connectionKey: string;
};

export function VkAllowMessagesWidget({ communityId, connectionKey }: VkAllowMessagesWidgetProps) {
  useEffect(() => {
    let cancelled = false;

    renderVkAllowMessagesWidget({ communityId, connectionKey }).catch((error) => {
      if (!cancelled) {
        console.error('Ошибка при инициализации VK виджета:', error);
      }
    });

    return () => {
      cancelled = true;
      clearVkAllowMessagesWidget();
    };
  }, [communityId, connectionKey]);

  return <div id={VK_ALLOW_MESSAGES_WIDGET_ELEMENT_ID} />;
}
