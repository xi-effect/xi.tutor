export type MockInviteT = {
  id: number;
  type: 'group' | 'tutor';
  name: string;
  info: string;
  avatarUrl?: string;
};

export const mockInvites: MockInviteT[] = [
  {
    id: 1,
    type: 'group',
    name: 'Practice English',
    info: '4 человека',
    avatarUrl: '',
  },
  {
    id: 2,
    type: 'tutor',
    name: 'Андрей Демидов',
    info: 'a.demidov',
    avatarUrl: '',
  },
];
