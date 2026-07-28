import { Cursor } from '@xipkg/icons';
import type { DrCollaboratorCursorProps } from '@ibodr/draw';
import { CollaboratorCursorBadge } from '@ibodr/draw';
import { useTranslation } from 'react-i18next';

export type CollaboratorCursorProps = DrCollaboratorCursorProps;

export function CollaboratorCursor({
  point,
  color,
  name,
  scale,
  layout,
}: DrCollaboratorCursorProps) {
  const { t } = useTranslation('board');
  const badgeOffset = layout?.badgeOffset ?? { x: 2, y: 4 };
  const iconOffset = layout?.iconOffset ?? { x: -12, y: -12 };

  return (
    <div
      style={{
        position: 'absolute',
        left: point.x,
        top: point.y,
        pointerEvents: 'none',
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        zIndex: 1100,
      }}
    >
      <div
        style={{
          transform: `translate(${iconOffset.x}px, ${iconOffset.y}px)`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        <Cursor style={{ width: 20, height: 20, fill: color }} />
      </div>

      <CollaboratorCursorBadge
        color={color}
        name={name ?? t('comments.user')}
        badgeOffset={badgeOffset}
      />
    </div>
  );
}
