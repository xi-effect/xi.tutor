import { userApiConfig, UserQueryKey } from 'common.api';
import { getAxiosInstance } from 'common.config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserData, ProfileData } from 'common.types';
import { handleError, showSuccess } from 'common.services';
import { AxiosError, AxiosResponse } from 'axios';

type UpdateRoleResponseT = {
  data: UserData;
  status: number;
};

type MutationContextT = {
  previousUser: UserData | undefined;
};

export type RoleT = 'tutor' | 'student';

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation<
    AxiosResponse<UpdateRoleResponseT>,
    AxiosError,
    Pick<ProfileData, 'default_layout'>,
    MutationContextT
  >({
    mutationFn: async (profileData: Pick<ProfileData, 'default_layout'>) => {
      if (
        !profileData.default_layout ||
        !['tutor', 'student'].includes(profileData.default_layout as RoleT)
      ) {
        throw new Error('Invalid role value');
      }

      const axiosInst = await getAxiosInstance();
      return axiosInst({
        method: userApiConfig[UserQueryKey.ChangeRole].method,
        url: userApiConfig[UserQueryKey.ChangeRole].getUrl(),
        data: profileData,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onMutate: async (profileData) => {
      await queryClient.cancelQueries({
        queryKey: [UserQueryKey.Home],
        exact: true,
      });

      const previousUser = queryClient.getQueryData<UserData>([UserQueryKey.Home]);

      if (previousUser && profileData.default_layout) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], {
          ...previousUser,
          default_layout: profileData.default_layout,
        });
      }

      return { previousUser };
    },
    onError: (err, _profileData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData([UserQueryKey.Home], context.previousUser);
      }
      handleError(err, 'role');
    },
    onSuccess: (response) => {
      if (response?.data?.data) {
        queryClient.setQueryData<UserData>([UserQueryKey.Home], response.data.data);
        queryClient.invalidateQueries({
          queryKey: [UserQueryKey.Home],
          exact: true,
          refetchType: 'none',
        });
        showSuccess('role');
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 400) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const updateRole = (role: RoleT) => {
    return updateProfileMutation.mutate({ default_layout: role });
  };

  return {
    updateRole,
    isLoading: updateProfileMutation.isPending,
    isError: updateProfileMutation.isError,
    error: updateProfileMutation.error,
  };
};
