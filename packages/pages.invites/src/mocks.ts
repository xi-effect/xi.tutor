import { InviteT } from './types';

export const mockInviteData: Record<string, InviteT> = {
  // Индивидуальное приглашение (новое), кейс: репетитор переходит на приглашение в собственнный кабинет
  '1': {
    kind: 'individual',
    tutor: {
      user_id: 1,
      display_name: 'Андрей Демидов',
    },
    existing_classroom_id: null,
  },
  // Индивидуальное приглашение (уже принято)
  '2': {
    kind: 'individual',
    tutor: {
      user_id: 2,
      display_name: 'Английский с репетитором',
    },
    existing_classroom_id: 2,
  },
  // Групповое приглашение (новое)
  '3': {
    kind: 'group',
    tutor: {
      user_id: 3,
      display_name: 'Мастер групп',
    },
    classroom: {
      name: 'Advanced English Group',
    },
    has_already_joined: false,
  },
  // Групповое приглашение (уже принято)
  '4': {
    kind: 'group',
    tutor: {
      user_id: 4,
      display_name: 'Practice English',
    },
    classroom: {
      name: 'Intermediate English',
    },
    has_already_joined: true,
  },
};
