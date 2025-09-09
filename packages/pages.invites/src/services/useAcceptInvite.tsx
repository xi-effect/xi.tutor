import { useMutation } from '@tanstack/react-query';
import { ClassroomResponseT } from '../types';
import { mockInviteData } from '../mocks';
import { useNavigate } from '@tanstack/react-router';

export const useAcceptInvite = () => {
  const navigate = useNavigate();

  return useMutation<ClassroomResponseT, Error, string>({
    mutationFn: async (code: string) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const invite = mockInviteData[code];

      if (invite.kind === 'individual') {
        return {
          kind: 'individual',
          id: 2,
          status: 'active',
          created_at: new Date().toISOString(),
          description: null,
          tutor_id: invite.tutor.user_id,
          name: invite.tutor.username,
        };
      } else {
        return {
          kind: 'group',
          id: 2,
          status: 'active',
          created_at: new Date().toISOString(),
          description: null,
          tutor_id: invite.tutor.user_id,
          name: invite.classroom.name,
        };
      }
    },
    onSuccess: (classroomData) => {
      navigate({ to: `/classrooms/${classroomData.id}` });
    },
    onError: (error) => {
      console.error('Ошибка:', error.message);
    },
  });
};
