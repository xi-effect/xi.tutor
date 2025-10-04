import { Badge } from '@xipkg/badge';
import { formatToShortDate } from 'pages.materials';
import { cn } from '@xipkg/utils';
import { LongAnswer, WhiteBoard } from '@xipkg/icons';

export type CardMaterialsProps = {
  value: {
    id: number;
    name: string;
    date: string;
    typeWork?: 'collaboration' | 'only_tutor' | 'draft';
    typeMaterial?: 'text' | 'board';
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

const iconClassName = 'size-6 fill-gray-100';

const mapIcon = {
  text: <LongAnswer className={iconClassName} />,
  board: <WhiteBoard className={iconClassName} />,
};

export const CardMaterials = ({ value }: CardMaterialsProps) => {
  const { name, date, typeWork = 'draft', typeMaterial = 'text' } = value;

  return (
    <div className="border-gray-30 bg-gray-0 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4">
      {typeWork && (
        <Badge
          variant="default"
          className={cn(
            'text-s-base px-2 py-1 font-medium',
            mapStyles[typeWork as keyof typeof mapStyles],
          )}
        >
          {typeWork && mapType[typeWork as keyof typeof mapType]}
        </Badge>
      )}

      <div className="flex flex-col items-start justify-start gap-4">
        <div className="flex flex-row items-center justify-start gap-2">
          {typeMaterial && mapIcon[typeMaterial as keyof typeof mapIcon]}
          <div className="text-l-base font-medium text-gray-100">{name}</div>
        </div>

        <div className="flex flex-row items-center justify-start gap-2">
          <span className="text-s-base text-gray-60 font-normal">
            Изменено: {formatToShortDate(date)}
          </span>
        </div>
      </div>
    </div>
  );
};
