import { useQuery } from '@tanstack/react-query';
import { mockInviteData } from '../mocks';
import { InviteT } from '../types';

export const useInvitePreview = (code: string) => {
  return useQuery<InviteT, Error>({
    queryKey: ['preview', code],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const invite = mockInviteData[code];

      if (!invite) {
        throw new Error('Приглашение не найдено');
      }

      if (code === '1') {
        throw new Error('Target is the source');
      }

      return invite;
    },
    enabled: !!code,
    retry: false,
  });
};
