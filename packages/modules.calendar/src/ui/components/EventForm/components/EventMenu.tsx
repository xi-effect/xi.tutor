import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Button } from '@xipkg/button';
import { Copy, FilePlus, FlipBackward, MoreVert, Trash } from '@xipkg/icons';
import {
  cardMenuButtonClass,
  cardMenuDeleteItemClass,
  cardMenuIconClass,
  cardMenuItemClass,
  cardMenuSeparatorClass,
  cardMenuSurfaceClass,
} from 'common.ui';
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
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="none" size="icon" className={cardMenuButtonClass}>
          <MoreVert className={cardMenuIconClass} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="end"
        className={cardMenuSurfaceClass}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem className={cardMenuItemClass}>
          <FlipBackward />
          {t('event_menu.cut')}
        </DropdownMenuItem>
        <DropdownMenuItem className={cardMenuItemClass} onClick={handleCopyEvent}>
          <Copy />
          {t('event_menu.copy')}
        </DropdownMenuItem>
        <DropdownMenuItem className={cardMenuItemClass}>
          <FilePlus />
          {t('event_menu.duble')}
        </DropdownMenuItem>
        <DropdownMenuSeparator className={cardMenuSeparatorClass} />
        <DropdownMenuItem error className={cardMenuDeleteItemClass} onClick={handleRemoveEvent}>
          <Trash />
          {t('event_menu.remove')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
