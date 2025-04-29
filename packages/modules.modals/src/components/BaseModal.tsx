import React from 'react';
import { useModals } from '../context';

interface BaseModalProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const BaseModal: React.FC<BaseModalProps> = ({ title, children, onClose }) => {
  const { closeModal } = useModals();

  const handleClose = () => {
    onClose?.();
    closeModal();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          width: '500px',
          maxWidth: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
          }}
        >
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
            }}
            onClick={handleClose}
          >
            &times;
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};
