import type { InviteAcceptFailureReason } from 'common.utils';
import type { ClassroomResponseT, InviteT } from '../types';

/** Preview: ученик уже связан с этим репетитором (кабинет или группа). */
export function isAlreadyConnected(invite: InviteT): boolean {
  return (
    (invite.kind === 'individual' && Boolean(invite.existing_classroom_id)) ||
    (invite.kind === 'group' && invite.has_already_joined)
  );
}

export function getExistingClassroomId(invite: InviteT): number | undefined {
  if (invite.kind === 'individual' && invite.existing_classroom_id) {
    return invite.existing_classroom_id;
  }

  if (invite.kind === 'group' && invite.has_already_joined && invite.classroom.id) {
    return invite.classroom.id;
  }

  return undefined;
}

export function hasConfirmedClassroom(
  data: ClassroomResponseT | undefined,
): data is ClassroomResponseT {
  return typeof data?.id === 'number';
}

export function getAcceptErrorVariant(
  reason: InviteAcceptFailureReason,
): 'not_found' | 'already_connected' | 'self_invite' | 'network' | 'generic' {
  if (reason === 'invite_not_found') return 'not_found';
  if (reason === 'already_connected') return 'already_connected';
  if (reason === 'self_invite') return 'self_invite';
  if (reason === 'network_error') return 'network';
  return 'generic';
}
