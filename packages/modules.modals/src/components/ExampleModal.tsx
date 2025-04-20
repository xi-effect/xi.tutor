import React from 'react';
import { BaseModal } from './BaseModal';

interface ExampleModalProps {
  message?: string;
  onConfirm?: () => void;
}

export const ExampleModal: React.FC<ExampleModalProps> = ({
  message = 'Это пример модального окна',
  onConfirm,
}) => {
  return (
    <BaseModal title="Пример модального окна">
      <div style={{ marginBottom: '20px' }}>{message}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            background: 'white',
            cursor: 'pointer',
          }}
          onClick={() => onConfirm?.()}
        >
          Подтвердить
        </button>
      </div>
    </BaseModal>
  );
};
