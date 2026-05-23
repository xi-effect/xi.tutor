import React from 'react';
import { Cursor } from '@xipkg/icons';

/** Props for the custom collaborator cursor overlay (DOM layer). */
export type CollaboratorCursorProps = {
  point: { x: number; y: number } | null;
  color: string;
  name?: string | null;
};

/**
 * Custom DOM cursor for collaborators. In draw v5 built-in cursors render on the canvas
 * via CollaboratorCursorOverlayUtil; pass this through InFrontOfTheCanvas only if you
 * disable the default overlay util.
 */
export const CollaboratorCursor: React.FC<CollaboratorCursorProps> = ({ point, color, name }) => {
  if (!point) return null;

  return (
    <div
      style={{
        position: 'absolute',
        marginLeft: 12,
        left: point.x,
        top: point.y,
        pointerEvents: 'none',
        transform: 'translate(0, 0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 20,
          height: 20,
          transform: 'translate(-16px, -2px)',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        <Cursor
          style={{
            width: '20px',
            height: '20px',
            fill: color,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 0,
          marginLeft: 4,
          padding: '4px 8px',
          backgroundColor: color,
          color: 'white',
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 8,
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          maxWidth: 120,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          border: '1px solid rgba(255,255,255,0.3)',
        }}
      >
        {name || 'Пользователь'}
      </div>
    </div>
  );
};
