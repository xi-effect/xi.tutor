import { Badge } from '@xipkg/badge';
import { formatToShortDate } from 'pages.materials';
import { cn } from '@xipkg/utils';
import { LongAnswer, WhiteBoard } from '@xipkg/icons';

import { DropdownButton } from './DropdownButton';

export type TypeWorkT = 'collaboration' | 'only_tutor' | 'draft';
export type TypeMaterialT = 'text' | 'board';

export type AccessTypesT = {
  id: number;
  name: string;
  date: string;
  typeWork?: TypeWorkT;
  typeMaterial?: TypeMaterialT;
  onDelete?: () => void;
};

export type CardMaterialsProps = {
  accessTypes?: AccessTypesT;
};

const accessMap: Record<TypeWorkT, string> = {
  collaboration: 'совместная работа',
  only_tutor: 'только репетитор',
  draft: 'черновик',
};

const mapStyles: Record<TypeWorkT, string> = {
  collaboration: 'bg-gray-10 text-gray-60',
  only_tutor: 'bg-cyan-20 text-cyan-100',
  draft: 'bg-violet-20 text-violet-100',
};

const iconClassName = 'size-6 fill-gray-100';

const mapIcon: Record<TypeMaterialT, React.ElementType> = {
  text: LongAnswer,
  board: WhiteBoard,
};

export const CardMaterials = ({ accessTypes }: CardMaterialsProps) => {
  if (!accessTypes) {
    return null;
  }

  const { name, date, typeWork = '', typeMaterial = '', onDelete } = accessTypes;

  const Icon = typeMaterial ? mapIcon[typeMaterial] : undefined;

  return (
    <div
      role="group"
      className="border-gray-30 bg-gray-0 flex min-h-[96px] min-w-[350px] flex-col items-start justify-start gap-2 rounded-2xl border p-4"
    >
      <div className="flex w-full flex-row items-center justify-between">
        {typeWork && accessMap[typeWork] && (
          <Badge
            variant="default"
            className={cn('text-s-base px-2 py-1 font-medium', mapStyles[typeWork])}
          >
            {accessMap[typeWork]}
          </Badge>
        )}

        <DropdownButton accessType={(typeWork as TypeWorkT) ?? ''} onDelete={onDelete} />
      </div>

      <div className="flex flex-col items-start justify-start gap-4">
        <div className="flex flex-row items-center justify-start gap-2">
          {Icon && <Icon className={iconClassName} aria-label={typeMaterial} />}
          <div className="text-l-base font-medium text-gray-100">{name}</div>
        </div>

        <div className="flex flex-row items-center justify-start gap-2">
          <span className="text-s-base text-gray-60 font-normal">
            Изменено: {date ? formatToShortDate(date) : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
