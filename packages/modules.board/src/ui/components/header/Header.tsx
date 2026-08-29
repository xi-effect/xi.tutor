/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Button } from '@xipkg/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useParams, useRouter } from '@tanstack/react-router';
import { AlarmClock, ArrowLeft, Edit, Maximize, Minimize, InfoCircle, Loader } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { useMaterialActions } from 'features.materials.card';
import { useFocusModeStore } from 'common.ui';
import { useEffect, useRef, useState } from 'react';
import { useBoardTimer } from '../../../hooks/useBoardTimer';
import { useYjsContext } from '../../../providers/YjsProvider';
import { stopEvent } from '../../../shapes/audio/constants';
import { CommentsFeedButton } from '../../../comments';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { SettingsDropdown } from './SettingsDropdown';
import { unlockBoardTimerAudio } from './boardTimerAudio';
import { TimerDropdown } from './TimerDropdown';
import {
  boardChromeZClass,
  boardIconClass,
  boardNativeInputClass,
  boardPanelClass,
  boardTextClass,
} from '../../boardTheme';
import { useTranslation } from 'react-i18next';
import { useBoardIsMobile } from '../shared';

export const Header = () => {
  const { isVisible: openTimer, setVisible: setOpenTimer } = useBoardTimer();
  const isMobile = useBoardIsMobile();
  const { focusMode, setFocusMode, toggleFocusMode } = useFocusModeStore();
  const { t } = useTranslation('board');
  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const { isReadonly } = useYjsContext();
  const { classroomId, boardId, materialId } = useParams({ strict: false });

  // Сбрасываем режим фокуса при уходе со страницы доски и на мобилке
  useEffect(() => {
    return () => setFocusMode(false);
  }, [setFocusMode]);

  useEffect(() => {
    if (isMobile && focusMode) setFocusMode(false);
  }, [isMobile, focusMode, setFocusMode]);

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getMaterial = (() => {
    if (classroomId) {
      if (isTutor) {
        return useGetClassroomMaterial;
      } else {
        return useGetClassroomMaterialStudent;
      }
    }

    return useGetMaterial;
  })();

  const materialIdValue = boardId ?? materialId;
  if (!materialIdValue) {
    throw new Error('boardId or materialId must be provided');
  }

  const { data: material, isLoading } = getMaterial({
    classroomId: classroomId || '',
    id: materialIdValue,
  });

  const { handleUpdateName, isUpdating } = useMaterialActions(
    material?.id,
    material?.content_kind,
    material?.name,
    classroomId || '',
  );

  // Сбрасываем режим фокуса при уходе со страницы доски
  useEffect(() => {
    return () => setFocusMode(false);
  }, [setFocusMode]);

  const handleBack = () => {
    if (focusMode) setFocusMode(false);
    if (classroomId) {
      router.navigate({ to: '/classrooms/$classroomId', params: { classroomId } });
    } else {
      router.navigate({
        to: '/materials',
        // @ts-ignore
        search: { tab: 'boards' },
      });
    }
  };

  const startEditing = () => {
    if (isUpdating) return;
    nameInputRef.current?.focus();
    setNameValue(material?.name || '');
    setIsEditMode(true);
  };

  const cancelEditing = () => {
    setNameValue(material?.name || '');
    setIsEditMode(false);
  };

  const submitName = () => {
    const trimmedValue = nameValue.trim();
    const currentName = material?.name || '';

    if (!trimmedValue || trimmedValue === currentName) {
      cancelEditing();
      return;
    }

    handleUpdateName(classroomId ? 'classroom' : 'personal', trimmedValue, () => {
      setIsEditMode(false);
    });
  };

  const handleNameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(event.target.value);
  };

  const handleNameInputBlur = () => {
    submitName();
  };

  const handleNameInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('here');
    if (event.key === 'Enter') {
      console.log('enter handler');
      event.preventDefault();
      nameInputRef.current?.blur();
    } else if (event.key === 'Escape') {
      console.log('esc handler');
      event.preventDefault();
      cancelEditing();
      nameInputRef.current?.blur();
    }
  };

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute top-4 right-0 left-0 flex items-start justify-between px-4 pb-4 md:pl-8',
          boardChromeZClass,
        )}
      >
        <div
          className={cn(
            boardPanelClass,
            'pointer-events-auto flex items-center',
            isEditMode ? 'pl-1' : 'px-1',
          )}
        >
          <Button
            variant="none"
            onClick={handleBack}
            type="button"
            className="hover:bg-status-info-background flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
            data-umami-event="board-back"
          >
            <ArrowLeft size="s" className={cn('h-4 w-4 lg:h-6 lg:w-6', boardIconClass)} />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-6 w-24 lg:h-8" />
          ) : (
            <div
              className={cn(
                'group relative -m-[1.5px] flex h-full min-w-0 items-center gap-0 rounded-xl border-2 py-1 lg:rounded-2xl',
                isEditMode
                  ? !nameValue
                    ? 'border-border-error caret-red-80'
                    : 'border-border-focus'
                  : 'border-transparent',
              )}
            >
              {isEditMode ? (
                <>
                  <div className="fixed inset-0 z-10" onPointerDown={submitName} />
                  <input
                    ref={nameInputRef}
                    value={nameValue}
                    onChange={handleNameInputChange}
                    onBlur={handleNameInputBlur}
                    onKeyDown={handleNameInputKeyDown}
                    disabled={isUpdating}
                    autoComplete="off"
                    placeholder={t('header.editInputPlaceholder')}
                    aria-label={t('header.editInputAria')}
                    aria-invalid={!nameValue}
                    autoFocus
                    data-board-name-input=""
                    style={{
                      color: 'var(--xi-text-primary)',
                      WebkitTextFillColor: 'var(--xi-text-primary)',
                      caretColor: 'var(--xi-brand-80)',
                      backgroundColor: 'transparent',
                    }}
                    className={cn(
                      boardNativeInputClass,
                      'text-l-base xs:max-w-[130px] flex h-6 max-w-[100px] min-w-0 rounded-xl px-1 disabled:opacity-50 md:max-w-[220px] lg:h-8 lg:rounded-2xl',
                    )}
                  />
                  {isUpdating && (
                    <span className="bg-background-surface pointer-events-none absolute top-1/2 right-1 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
                      <Loader size="s" className={cn(boardIconClass, 'h-4 w-4 animate-spin')} />
                    </span>
                  )}
                  {!nameValue && (
                    <div className="text-red-80 xs:w-max xs:max-w-none bg-red-0 absolute top-8 my-1 flex max-w-[100px] min-w-0 items-center gap-1 rounded-sm p-1">
                      <InfoCircle size="s" className={`border-red-80 text-red-80 h-4 w-4`} />
                      <p className="flex-1">{t('header.editInputError')}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <h1
                          onClick={startEditing}
                          className={cn(
                            boardTextClass,
                            isTutor ? 'cursor-pointer' : '',
                            'text-l-base xs:max-w-[150px] flex h-6 max-w-[100px] min-w-0 items-center px-1 select-none md:max-w-[240px] lg:h-8',
                          )}
                        >
                          <span className="block min-w-0 truncate">
                            {material?.name || t('header.emptyName')}
                          </span>
                        </h1>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[360px] wrap-break-word">
                          {material?.name || t('header.emptyName')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {isTutor && (
                    <Button
                      type="button"
                      variant="none"
                      className="hover:bg-status-info-background flex h-6 w-6 items-center justify-center rounded-lg p-0 transition-opacity group-hover:opacity-100 focus:bg-transparent focus-visible:opacity-100 lg:h-8 lg:w-8 lg:rounded-xl pointer-fine:opacity-0"
                      onClick={startEditing}
                      data-umami-event="board-edit-name"
                    >
                      <Edit size="s" className={cn('h-4 w-4 lg:h-6 lg:w-6', boardIconClass)} />
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex w-[172px] flex-col-reverse items-end gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <TimerDropdown />
          </div>
          <div
            className={`${boardPanelClass} pointer-events-auto flex items-center justify-center gap-2 p-1 pl-2`}
          >
            {!isReadonly && <CollaboratorAvatars />}
            <CommentsFeedButton />
            <Button
              variant="none"
              className={cn(
                'hover:bg-status-info-background flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl',
                openTimer &&
                  'bg-action-primary-background-disabled/40 focus:bg-action-primary-background-disabled/40',
              )}
              data-umami-event="board-timer-menu"
              onPointerDown={stopEvent}
              onClick={(e) => {
                e.stopPropagation();
                unlockBoardTimerAudio();
                setOpenTimer(!openTimer);
              }}
            >
              <AlarmClock size="s" className={`h-4 w-4 lg:h-6 lg:w-6 ${boardIconClass}`} />
            </Button>
            {!isMobile && (
              <Button
                variant="none"
                onClick={toggleFocusMode}
                type="button"
                className="hover:bg-status-info-background flex h-6 w-6 items-center justify-center rounded-lg p-0 focus:bg-transparent lg:h-8 lg:w-8 lg:rounded-xl"
                data-umami-event="board-toggle-focus-mode"
                data-umami-event-state={focusMode ? 'exit' : 'enter'}
              >
                {focusMode ? (
                  <Minimize size="s" className={`h-4 w-4 lg:h-6 lg:w-6 ${boardIconClass}`} />
                ) : (
                  <Maximize size="s" className={`h-4 w-4 lg:h-6 lg:w-6 ${boardIconClass}`} />
                )}
              </Button>
            )}
            <SettingsDropdown />
          </div>
        </div>
      </div>
    </>
  );
};
