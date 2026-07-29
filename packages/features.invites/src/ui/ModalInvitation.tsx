import { env } from 'common.env';
import { type InviteAnalyticsSource } from 'common.utils';
import { ModalInvitationLegacy } from './ModalInvitationLegacy';
import { ModalInvitationV2 } from './ModalInvitationV2';

export type ModalInvitationProps = {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  analyticsSource?: InviteAnalyticsSource;
};

/**
 * Новый сценарий приглашения ученика: одна актуальная ссылка + готовое
 * сообщение (см. ТЗ «Улучшение приглашения учеников»).
 *
 * `VITE_LEGACY_INVITES_MODAL_ENABLED` — временный откат к старой модалке
 * со списком ссылок на случай проблем с новым сценарием, до полной проверки
 * (см. `ModalInvitationLegacy`). По умолчанию выключен.
 */
export const ModalInvitation = (props: ModalInvitationProps) => {
  if (env.VITE_LEGACY_INVITES_MODAL_ENABLED) {
    return <ModalInvitationLegacy {...props} />;
  }

  return <ModalInvitationV2 {...props} />;
};
