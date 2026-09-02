import { Close } from '@xipkg/icons';
import { modalCloseButtonClass, modalCloseIconClass } from './modalChrome';

type ModalCloseIconProps = {
  onClick?: () => void;
  disabled?: boolean;
  'aria-label'?: string;
};

export const ModalCloseIcon = ({
  onClick,
  disabled,
  'aria-label': ariaLabel = 'Close',
}: ModalCloseIconProps) => (
  <button
    type="button"
    className={modalCloseButtonClass}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
  >
    <Close className={modalCloseIconClass} />
  </button>
);
