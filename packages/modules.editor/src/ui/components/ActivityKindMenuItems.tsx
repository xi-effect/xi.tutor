import { DropdownMenuItem } from '@xipkg/dropdown';
import {
  ACTIVITY_KIND_ICONS,
  DOCUMENT_ACTIVITY_KINDS,
  type ActivityKind,
} from 'modules.board/activities';
import { useTranslation } from 'react-i18next';

const menuItemClass =
  'text-text-primary hover:bg-background-page focus:text-text-primary fill-icon-primary [&_svg]:fill-icon-primary h-7 gap-2 rounded p-1 text-sm';

export function ActivityKindMenuItems({ onSelect }: { onSelect: (kind: ActivityKind) => void }) {
  const { t } = useTranslation('board');

  return DOCUMENT_ACTIVITY_KINDS.map((kind) => {
    const Icon = ACTIVITY_KIND_ICONS[kind];
    return (
      <DropdownMenuItem key={kind} className={menuItemClass} onSelect={() => onSelect(kind)}>
        <Icon className="size-6" />
        <span>{t(`activity.kinds.${kind}`)}</span>
      </DropdownMenuItem>
    );
  });
}
