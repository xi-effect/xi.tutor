import { useNavigate, useSearch } from '@tanstack/react-router';
import { ClassroomMaterialsT } from 'common.types';
import { formatToShortDate } from 'pages.materials';

type MaterialProps = {
  material: ClassroomMaterialsT;
  isLoading: boolean;
};

export const Material = ({ material, isLoading }: MaterialProps) => {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });

  const { id, name, updated_at, content_kind } = material;

  const handleClick = () => {
    // Сохраняем параметр call при переходе к материалу
    const filteredSearch = search.call ? { call: search.call } : {};

    const route = content_kind === 'board' ? `/materials/${id}/board` : `/materials/${id}/note`;

    navigate({
      to: route,
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...filteredSearch,
      }),
    });
  };

  return (
    <div
      className="border-gray-60 hover:bg-gray-5 flex min-h-[96px] min-w-[350px] cursor-pointer flex-col items-start justify-start gap-2 rounded-2xl border p-4"
      onClick={handleClick}
    >
      <h3 className="text-l-base font-medium text-gray-100">{name}</h3>
      <div className="flex flex-row items-center justify-start gap-2">
        <span className="text-s-base text-gray-80 font-medium">
          Изменено: {isLoading ? '...' : updated_at ? formatToShortDate(updated_at) : ''}
        </span>
      </div>
    </div>
  );
};
