/** Поверхность модалки — как у ConfirmDialog. */
export const modalContentClass =
  'bg-background-surface w-full max-w-[480px] rounded-3xl p-0 shadow-[0px_24px_32px_0px_rgba(16,16,16,0.08),0px_16px_16px_0px_rgba(16,16,16,0.08)]';

export const modalBodyClass = 'flex flex-col gap-6 p-6';

export const modalHeaderRowClass = 'flex items-center justify-between gap-4 overflow-hidden';

export const modalTitleClass =
  'font-playfair text-text-primary m-0 flex-1 text-2xl leading-normal font-medium';

export const modalDescriptionClass = 'text-m-base text-text-secondary m-0 leading-5';

export const modalFooterClass = 'flex items-start justify-end gap-3 overflow-hidden pt-3';

export const modalCancelButtonClass =
  'bg-background-page text-text-secondary hover:bg-background-subtle hover:text-text-secondary focus:bg-background-subtle focus:text-text-secondary active:bg-background-subtle active:text-text-secondary h-auto rounded-xl px-5 py-2.5 font-medium';

export const modalConfirmButtonClass = 'h-auto rounded-xl px-5 py-2.5 font-medium';

export const modalCloseButtonClass =
  'group flex size-6 shrink-0 items-center justify-center bg-transparent p-0';

export const modalCloseIconClass =
  'fill-icon-secondary group-hover:fill-icon-primary size-6 transition-colors';
