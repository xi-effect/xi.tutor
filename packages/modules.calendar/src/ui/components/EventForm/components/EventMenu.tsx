import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { MenuDots } from '@xipkg/icons';
import { useActiveEventId, useCloseForm } from '../../../../store/formEventStore';
import { useAddEvent, useDeleteEvent, useEventById } from '../../../../store/eventsStore';

export const EventMenu = () => {
  const { t } = useTranslation('calendar');
  const activeEventId = useActiveEventId();
  const getEventById = useEventById();
  const addEvent = useAddEvent();
  const removeEvent = useDeleteEvent();
  const closeEventForm = useCloseForm();

  const handleCopyEvent = () => {
    const copiedEvent = getEventById(activeEventId);
    if (copiedEvent) {
      addEvent({ ...copiedEvent, id: crypto.randomUUID() });
    }
    closeEventForm();
  };

  const handleRemoveEvent = () => {
    removeEvent(activeEventId);
    closeEventForm();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-gray-0 flex h-8 w-8 items-center justify-center text-sm">
        <MenuDots className="fill-gray-80 rotate-90" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>{t('event_menu.cut')}</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyEvent}>{t('event_menu.copy')}</DropdownMenuItem>
        <DropdownMenuItem>{t('event_menu.duble')}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-80" onClick={handleRemoveEvent}>
          {t('event_menu.remove')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
