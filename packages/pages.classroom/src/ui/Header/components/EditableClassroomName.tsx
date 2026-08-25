import { useEffect, useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { Edit, InfoCircle } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { cn } from '@xipkg/utils';
import { useUpdateGroupClassroom, useUpdateIndividualClassroom } from 'common.services';
import { useTranslation } from 'react-i18next';
import { classroomPageTitleClass } from '../../sectionTitleClass';

const NAME_MAX_LENGTH = 100;

type EditableClassroomNameProps = {
  classroomId: number;
  kind: 'individual' | 'group';
  name: string;
  canEdit: boolean;
};

export const EditableClassroomName = ({
  classroomId,
  kind,
  name,
  canEdit,
}: EditableClassroomNameProps) => {
  const { t } = useTranslation('classroom');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const { updateIndividualClassroom, isUpdating: isUpdatingIndividual } =
    useUpdateIndividualClassroom();
  const { updateGroupClassroom, isUpdating: isUpdatingGroup } = useUpdateGroupClassroom();
  const isUpdating = isUpdatingIndividual || isUpdatingGroup;

  useEffect(() => {
    if (!isEditMode) {
      setNameValue(name);
    }
  }, [name, isEditMode]);

  const startEditing = () => {
    if (!canEdit || isUpdating) return;
    setNameValue(name);
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setNameValue(name);
    setIsEditMode(false);
  };

  const submitName = () => {
    const trimmedValue = nameValue.trim();

    if (!trimmedValue || trimmedValue === name) {
      cancelEditing();
      return;
    }

    const onSuccess = () => setIsEditMode(false);

    if (kind === 'individual') {
      updateIndividualClassroom(
        {
          classroomId,
          data: { name_override: trimmedValue },
        },
        { onSuccess },
      );
      return;
    }

    updateGroupClassroom(
      {
        classroomId,
        data: { name: trimmedValue },
      },
      { onSuccess },
    );
  };

  const handleNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      nameInputRef.current?.blur();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
      nameInputRef.current?.blur();
    }
  };

  if (!canEdit) {
    return <h1 className={classroomPageTitleClass}>{name}</h1>;
  }

  return (
    <div
      className={cn(
        'group relative m-[-1.5px] flex min-w-0 flex-1 items-center gap-1 rounded-xl border-2 py-0.5',
        isEditMode
          ? !nameValue.trim()
            ? 'border-border-error'
            : 'border-border-focus'
          : 'border-transparent',
      )}
    >
      {isEditMode ? (
        <>
          <input
            ref={nameInputRef}
            value={nameValue}
            onChange={(event) => setNameValue(event.target.value.slice(0, NAME_MAX_LENGTH))}
            onBlur={submitName}
            onKeyDown={handleNameInputKeyDown}
            disabled={isUpdating}
            autoComplete="off"
            placeholder={t('header.editNamePlaceholder')}
            aria-label={t('header.editNameAria')}
            aria-invalid={!nameValue.trim()}
            autoFocus
            className={cn(
              classroomPageTitleClass,
              'caret-brand-80 w-full bg-transparent px-1 outline-none disabled:opacity-50',
            )}
          />
          {!nameValue.trim() ? (
            <div className="bg-red-0 text-red-80 absolute top-full left-0 z-10 mt-1 flex max-w-full items-center gap-1 rounded-sm p-1">
              <InfoCircle className="fill-red-80 size-4 shrink-0" />
              <p className="text-xs-base">{t('header.editNameError')}</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <Tooltip delayDuration={2000}>
            <TooltipTrigger asChild>
              <h1
                onClick={startEditing}
                className={cn(classroomPageTitleClass, 'm-0 cursor-pointer px-1 leading-tight')}
              >
                {name}
              </h1>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="none"
            className="hover:bg-status-info-background flex size-8 shrink-0 translate-y-1 items-center justify-center rounded-xl p-0 opacity-0 transition-opacity group-hover:opacity-100 focus:bg-transparent focus-visible:opacity-100"
            onClick={startEditing}
            aria-label={t('header.editNameAria')}
            data-umami-event="classroom-edit-name"
          >
            <Edit className="fill-icon-secondary size-5" />
          </Button>
        </>
      )}
    </div>
  );
};
