import { UserProfile } from '@xipkg/userprofile';
import { useNavigate } from '@tanstack/react-router';

export const Classroom = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate({ to: '/classrooms/$classroomId', params: { classroomId: '1' } });
      }}
      type="button"
      className="hover:bg-gray-5 border-gray-60 flex min-h-[108px] w-[122px] flex-col items-center justify-start gap-1 rounded-2xl border bg-transparent p-4"
    >
      <UserProfile userId={1} withOutText />
      <div className="flex h-full w-full flex-row items-center justify-center gap-2">
        <h3 className="text-s-base line-clamp-2 w-full text-center font-medium text-gray-100">
          Анна Смирнова
        </h3>
      </div>
    </button>
  );
};
