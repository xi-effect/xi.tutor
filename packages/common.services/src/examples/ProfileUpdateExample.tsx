import { useUpdateProfile, ProfileData } from '../user';
import { toast } from 'sonner'; // Предполагаем, что библиотека для тостов используется в проекте

export const ProfileUpdateExample = () => {
  const { updateProfile } = useUpdateProfile();
  const { mutate, isLoading, isError, error } = updateProfile;

  const handleProfileUpdate = (profileData: ProfileData) => {
    mutate(profileData, {
      onSuccess: (response) => {
        if (response.status === 200) {
          toast('Профиль успешно обновлен');
        }
      },
      onError: (error) => {
        console.error('Ошибка при обновлении профиля:', error);
        toast('Произошла ошибка при обновлении профиля');
      },
    });
  };

  return (
    <div>
      <button
        onClick={() =>
          handleProfileUpdate({
            username: 'new_username',
            display_name: 'Новое имя',
          })
        }
        disabled={isLoading}
      >
        {isLoading ? 'Обновление...' : 'Обновить профиль'}
      </button>

      {isError && <div style={{ color: 'red' }}>Ошибка: {error.message}</div>}
    </div>
  );
};
