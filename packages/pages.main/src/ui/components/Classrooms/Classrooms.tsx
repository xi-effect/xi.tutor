import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, ArrowRight, Group, UserPlus } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@xipkg/tooltip';
import { useNavigate } from '@tanstack/react-router';
import { useCurrentUser, useFetchClassrooms, useFetchClassroomsByStudent } from 'common.services';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ModalAddGroup } from 'features.group.add';
import { ModalInvitation } from 'features.invites';
import { EmptyClassrooms } from 'common.ui';
import { Classroom } from './Classroom';
import { ClassroomCardSkeleton } from './ClassroomCardSkeleton';
import { SectionEmptyState } from '../SectionEmptyState';
import { FORCE_MAIN_LISTS_LOADING, MAIN_LIST_SKELETON_COUNT } from '../../forceListsLoading';
import { sectionEmptyStateIllustrationClass } from '../sectionEmptyStateIllustrationClass';
import { WidgetHeader } from '../WidgetHeader';
import { galleryShadowHeaderInsetClass } from '../galleryShadowClass';
import { WidgetCardsCarousel, widgetCardSlotClass } from '../WidgetCardsCarousel';
import { cn, useMediaQuery } from '@xipkg/utils';

const emptyClassroomsIllustrationClass = cn(sectionEmptyStateIllustrationClass, '-translate-x-8');

export const Classrooms = () => {
  const { t } = useTranslation('main');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { data: tutorClassrooms, isLoading: isTutorLoading } = useFetchClassrooms(
    undefined,
    !isTutor,
  );
  const { data: studentClassrooms, isLoading: isStudentLoading } = useFetchClassroomsByStudent(
    undefined,
    isTutor,
  );

  const classrooms = isTutor ? tutorClassrooms : studentClassrooms;
  const isLoading = FORCE_MAIN_LISTS_LOADING || (isTutor ? isTutorLoading : isStudentLoading);

  const [selectedSubject] = useState<string>('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [addGroupModalOpen, setAddGroupModalOpen] = useState(false);
  const navigate = useNavigate();

  const filteredClassrooms = useMemo(() => {
    if (!classrooms) return [];
    if (!isTutor) return classrooms;

    return classrooms.filter((classroom) => {
      const matchesSubject =
        selectedSubject === 'all' ||
        (selectedSubject === 'english' && classroom.subject_id === 1) ||
        (selectedSubject === 'math' && classroom.subject_id === 2);
      return matchesSubject;
    });
  }, [classrooms, selectedSubject, isTutor]);

  const handleMore = () => {
    navigate({ to: '/classrooms' });
  };

  const emptyMessage = isTutor
    ? selectedSubject !== 'all'
      ? t('classrooms.emptyNotFound')
      : t('classrooms.emptyInvite')
    : t('classrooms.emptyStudent');

  const inviteEmptyButtonClass =
    'bg-status-info-background hover:bg-action-primary-background-disabled/50 active:bg-action-primary-background-disabled/50 text-xs-base flex h-8 items-center gap-2 rounded-lg border-transparent px-4 font-medium text-text-link';

  const headerActions =
    isTutor && !isMobile ? (
      <>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="primary"
              className="flex size-10 items-center justify-center rounded-[10px] p-0"
              data-umami-event="invite-student-button"
              id="invite-student-button"
            >
              <Add className="fill-text-on-accent size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            className="border-border-default bg-background-surface flex w-[320px] flex-col gap-2.5 rounded-2xl border px-6 py-5 shadow-lg"
          >
            <DropdownMenuLabel className="text-m-base text-text-primary p-0 font-medium">
              {t('common.add')}
            </DropdownMenuLabel>
            <div className="flex flex-col gap-3">
              <DropdownMenuItem
                className="border-border-default bg-background-surface focus:bg-background-surface data-highlighted:bg-background-page flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                onSelect={() => {
                  setDropdownOpen(false);
                  setInviteModalOpen(true);
                }}
                data-umami-event="classrooms-add-student"
              >
                <UserPlus className="fill-icon-primary size-4 shrink-0" />
                <span className="text-s-base text-text-primary flex-1 text-left font-medium">
                  {t('classrooms.addStudent')}
                </span>
                <Add className="fill-icon-brand size-4 shrink-0" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="border-border-default bg-background-surface focus:bg-background-surface data-highlighted:bg-background-page flex h-9 w-[272px] cursor-pointer flex-row items-center gap-2 rounded-lg border p-2 px-3 focus:outline-none"
                onSelect={() => {
                  setDropdownOpen(false);
                  setAddGroupModalOpen(true);
                }}
                data-umami-event="classrooms-add-group"
              >
                <Group className="fill-icon-primary size-4 shrink-0" />
                <span className="text-s-base text-text-primary flex-1 text-left font-medium">
                  {t('classrooms.addGroup')}
                </span>
                <Add className="fill-icon-brand size-4 shrink-0" />
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <ModalInvitation
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          analyticsSource="main"
        />
        <ModalAddGroup open={addGroupModalOpen} onOpenChange={setAddGroupModalOpen} />
      </>
    ) : (
      <Tooltip delayDuration={1000}>
        <TooltipTrigger asChild>
          <Button
            variant="none"
            className="hover:bg-background-subtle flex size-8 items-center justify-center rounded-lg p-0"
            onClick={handleMore}
          >
            <ArrowRight className="fill-icon-secondary size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('classrooms.toClassrooms')}</TooltipContent>
      </Tooltip>
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className={galleryShadowHeaderInsetClass}>
        <WidgetHeader title={t('classrooms.title')} actions={headerActions} isMobile={isMobile} />
      </div>

      {isLoading ? (
        <WidgetCardsCarousel>
          {Array.from({ length: MAIN_LIST_SKELETON_COUNT }).map((_, i) => (
            <div key={i} className={widgetCardSlotClass}>
              <ClassroomCardSkeleton />
            </div>
          ))}
        </WidgetCardsCarousel>
      ) : filteredClassrooms && filteredClassrooms.length > 0 ? (
        <WidgetCardsCarousel>
          {filteredClassrooms.map((classroom) => (
            <div key={classroom.id} className={widgetCardSlotClass}>
              <Classroom classroom={classroom} isLoading={isLoading} />
            </div>
          ))}
        </WidgetCardsCarousel>
      ) : isTutor && selectedSubject === 'all' ? (
        <SectionEmptyState
          title={t('classrooms.emptyTitle')}
          description={t('classrooms.emptyDescription')}
          minHeightClass="min-h-[160px] sm:min-h-[180px]"
          illustration={<EmptyClassrooms className={emptyClassroomsIllustrationClass} />}
          actions={
            !isMobile ? (
              <Button
                type="button"
                variant="none"
                className={inviteEmptyButtonClass}
                onClick={() => setInviteModalOpen(true)}
                data-umami-event="classrooms-empty-invite"
              >
                {t('classrooms.inviteStudent')}
                <UserPlus className="text-text-link size-4 shrink-0" />
              </Button>
            ) : undefined
          }
        />
      ) : (
        <SectionEmptyState
          title={emptyMessage}
          description={t('classrooms.studentEmptyDescription')}
          minHeightClass="min-h-[160px]"
          illustration={<EmptyClassrooms className={emptyClassroomsIllustrationClass} />}
        />
      )}
    </div>
  );
};
