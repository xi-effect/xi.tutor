import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@xipkg/modal';
import { Button } from '@xipkg/button';
import { ScrollArea } from '@xipkg/scrollarea';
import { Avatar, AvatarFallback, AvatarImage } from '@xipkg/avatar';
import { cn } from '@xipkg/utils';
import { getClassroomDisplayName, type ClassroomStatusT, type ClassroomT } from 'common.api';
import {
  useActivateClassrooms,
  useAllTutorClassrooms,
  useClassroomCounts,
  useMonetizationDevStore,
  useStudentById,
} from 'common.services';
import { SUBSCRIPTION_BILLING_ENABLED, useSubscriptionPlan } from 'common.subscription';
import { useTranslation } from 'react-i18next';

const lockedStatuses: readonly ClassroomStatusT[] = ['locked'];

type ClassroomCardProps = {
  classroom: ClassroomT;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
};

const ClassroomCard = ({ classroom, isSelected, isDisabled, onSelect }: ClassroomCardProps) => {
  const isIndividual = classroom.kind === 'individual';
  const studentId = isIndividual ? classroom.student_id : undefined;
  const { data: student, isLoading: isLoadingStudent } = useStudentById(
    studentId || 0,
    !isIndividual || !studentId,
  );
  const title = getClassroomDisplayName(classroom);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isDisabled}
      aria-pressed={isSelected}
      data-umami-event="classroom-keep-active-select"
      data-umami-event-classroom-id={classroom.id}
      className={cn(
        'border-border-strong bg-background-surface hover:border-border-focus flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-4 text-left shadow-sm transition-colors',
        isSelected && 'border-border-focus bg-status-info-background',
        isDisabled && 'hover:border-border-strong cursor-not-allowed',
      )}
    >
      {isIndividual && studentId ? (
        <Avatar size="m">
          <AvatarImage
            src={`https://api.sovlium.ru/files/users/${studentId}/avatar.webp`}
            alt="user avatar"
          />
          {isLoadingStudent ? (
            <AvatarFallback size="m" loading />
          ) : (
            <AvatarFallback size="m">
              {student?.display_name?.[0]?.toUpperCase() || title[0]?.toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <div className="bg-action-primary-background-default text-text-on-accent flex h-10 min-h-10 w-10 min-w-10 items-center justify-center rounded-full text-sm font-medium">
          {title[0]?.toUpperCase() || ''}
        </div>
      )}
      <h3 className="text-m-base text-text-primary line-clamp-2 flex-1">{title}</h3>
    </button>
  );
};

export const KeepActiveClassroomsModal = () => {
  const { t } = useTranslation('classrooms');
  const { isBasic, isPlanReady, tariff } = useSubscriptionPlan();
  const countsQuery = useClassroomCounts();
  const counts = countsQuery.data;
  const maxActiveClassrooms = tariff?.maxActiveClassrooms ?? 0;
  const shouldOffer =
    SUBSCRIPTION_BILLING_ENABLED &&
    isPlanReady &&
    isBasic &&
    maxActiveClassrooms > 0 &&
    counts?.active === 0 &&
    counts.locked > 0;

  const keepActiveRequested = useMonetizationDevStore(
    (state) => state.override.keepActiveRequested,
  );
  const consumeKeepActive = useMonetizationDevStore((state) => state.consumeKeepActive);
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const offeredRef = useRef(false);

  useEffect(() => {
    if (!keepActiveRequested) return;
    consumeKeepActive();
    setOpen(true);
  }, [consumeKeepActive, keepActiveRequested]);

  useEffect(() => {
    if (!shouldOffer || offeredRef.current) return;
    offeredRef.current = true;
    setOpen(true);
  }, [shouldOffer]);

  const catalog = useMonetizationDevStore((state) => state.override.classroomCatalog);
  const {
    classrooms: fetchedClassrooms,
    isLoading: isFetchingClassrooms,
    isError,
  } = useAllTutorClassrooms(open && !catalog, lockedStatuses);
  const lockedClassrooms = useMemo(() => {
    const source = catalog ?? fetchedClassrooms;
    return source
      .filter((classroom) => classroom.status === 'locked')
      .sort((left, right) =>
        getClassroomDisplayName(left).localeCompare(getClassroomDisplayName(right), 'ru', {
          sensitivity: 'base',
        }),
      );
  }, [catalog, fetchedClassrooms]);
  const isLoading = catalog ? false : isFetchingClassrooms;
  const { activateClassrooms, isActivating } = useActivateClassrooms();
  const listReady = !isLoading && !isError;
  const requiredCount = Math.min(
    maxActiveClassrooms,
    listReady ? lockedClassrooms.length : (counts?.locked ?? 0),
  );
  const canConfirm =
    listReady && requiredCount > 0 && selectedIds.length === requiredCount && !isActivating;

  const lockedIdsKey = lockedClassrooms.map((classroom) => classroom.id).join(',');

  useEffect(() => {
    if (!listReady) return;
    const lockedIds = new Set(lockedIdsKey.length === 0 ? [] : lockedIdsKey.split(',').map(Number));
    setSelectedIds((current) => {
      const next = current.filter((id) => lockedIds.has(id));
      if (next.length === current.length && next.every((id, index) => id === current[index])) {
        return current;
      }
      return next;
    });
  }, [listReady, lockedIdsKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSelectedIds([]);
  };

  const toggleClassroom = (classroomId: number) => {
    setSelectedIds((current) => {
      if (current.includes(classroomId)) {
        return current.filter((id) => id !== classroomId);
      }
      if (current.length >= requiredCount) return current;
      return [...current, classroomId];
    });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;

    activateClassrooms(selectedIds, {
      onSuccess: () => handleOpenChange(false),
    });
  };

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="w-full max-w-2xl max-sm:w-[calc(100vw-32px)]">
        <ModalCloseButton className="right-2" />
        <ModalHeader className="border-border-default border-b">
          <ModalTitle className="font-playfair text-text-primary m-0 max-w-[calc(100%-48px)] text-2xl leading-normal font-medium">
            {t('keepActive.title')}
          </ModalTitle>
          <ModalDescription>
            {t('keepActive.description', { count: requiredCount })}
          </ModalDescription>
          <p className="text-text-secondary m-0 text-sm leading-5">{t('keepActive.changeLater')}</p>
        </ModalHeader>

        <div className="min-h-[300px] py-4 pr-2 pl-6 max-sm:min-h-[240px] max-sm:py-3 max-sm:pr-3 max-sm:pl-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-secondary">{t('keepActive.loading')}</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-danger">{t('keepActive.error')}</p>
            </div>
          ) : lockedClassrooms.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-m-base text-text-secondary text-center">{t('keepActive.empty')}</p>
            </div>
          ) : (
            <ScrollArea className="h-full max-h-[400px] w-full">
              <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
                {lockedClassrooms.map((classroom) => {
                  const isSelected = selectedIds.includes(classroom.id);
                  return (
                    <ClassroomCard
                      key={classroom.id}
                      classroom={classroom}
                      isSelected={isSelected}
                      isDisabled={!isSelected && selectedIds.length >= requiredCount}
                      onSelect={() => toggleClassroom(classroom.id)}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        <ModalFooter className="border-border-default flex items-center justify-between gap-4 border-t">
          <p className="text-s-base text-text-secondary m-0 shrink-0">
            {t('keepActive.selected', { selected: selectedIds.length, count: requiredCount })}
          </p>
          <div className="flex justify-end gap-2 max-sm:flex-col max-sm:gap-3">
            <Button
              size="m"
              variant="none"
              onClick={() => handleOpenChange(false)}
              className="bg-background-page hover:bg-background-subtle text-text-primary h-12 w-full sm:w-fit"
              data-umami-event="classroom-keep-active-cancel"
            >
              {t('keepActive.cancel')}
            </Button>
            <Button
              size="m"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="disabled:text-text-secondary w-full sm:w-fit"
              data-umami-event="classroom-keep-active-confirm"
            >
              {isActivating ? t('keepActive.confirming') : t('keepActive.confirm')}
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
