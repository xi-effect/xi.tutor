import { Badge } from '@xipkg/badge';
import { formatToShortDate } from 'pages.materials';
import { cn } from '@xipkg/utils';

export type CardMaterialsProps = {
  value: {
    id: number;
    name: string;
    date: string;
    type?: 'collaboration' | 'only_tutor' | 'draft';
  };
};

const mapType = {
  collaboration: 'совместное создание',
  only_tutor: 'только репетитор',
  draft: 'черновик',
};

const mapStyles = {
  collaboration: 'bg-gray-10 text-gray-60',
  only_tutor: 'bg-cyan-20 text-cyan-100',
  draft: 'bg-violet-20 text-violet-100',
};

export const CardMaterials = ({ value }: CardMaterialsProps) => {
  const { name, date, type } = value;

  return (
    <div className="border-gray-30 bg-gray-0 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      {type && (
        <Badge
          variant="default"
          className={cn(
            'text-s-base px-2 py-1 font-medium',
            mapStyles[type as keyof typeof mapStyles],
          )}
        >
          {type && mapType[type as keyof typeof mapType]}
        </Badge>
      )}

      <div className="flex flex-col items-start justify-start gap-4">
        <h3 className="text-l-base font-medium text-gray-100">{name}</h3>
        <div className="flex flex-row items-center justify-start gap-2">
          <span className="text-s-base text-gray-80 font-medium">
            Изменено: {formatToShortDate(date)}
          </span>
        </div>
      </div>
    </div>
  );
};
