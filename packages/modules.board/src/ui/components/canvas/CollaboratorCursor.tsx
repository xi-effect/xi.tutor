import React from 'react';
import { TLCursorProps } from 'tldraw';
import { Cursor } from '@xipkg/icons';

export const CollaboratorCursor: React.FC<TLCursorProps> = ({ point, color, name }) => {
  if (!point) return null;

  return (
    <div
      style={{
        position: 'absolute',
        marginLeft: 12,
        left: point.x,
        top: point.y,
        pointerEvents: 'none',
        transform: 'translate(0, 0)', // Курсор указывает точно на позицию мыши
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        zIndex: 1000,
      }}
    >
      {/* Иконка курсора */}
      <div
        style={{
          position: 'relative',
          width: 20,
          height: 20,
          transform: 'translate(-16px, -2px)', // Смещаем курсор так, чтобы остриё указывало на позицию мыши
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

      {/* Имя пользователя */}
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
