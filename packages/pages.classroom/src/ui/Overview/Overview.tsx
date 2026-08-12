import { useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { Add, FileSmall, WhiteBoard } from '@xipkg/icons';
import { useGetClassroom, useCurrentUser, useAddClassroomMaterials } from 'common.services';
import { InvoiceModal } from 'features.invoice';
import { ModalStudentsGroup } from 'features.group.manage';
import { useTranslation } from 'react-i18next';
import { OverviewSkeleton } from './OverviewSkeleton';
import { SectionContainer } from './SectionContainer';
import { MaterialsList } from './MaterialsList';
import { PaymentsList } from './PaymentsList';
import { StudentsList } from './StudentsList';
import { UpcomingLessonsSection } from './UpcomingLessonsSection';
import { primaryIconButtonClass } from '../galleryShadowClass';

type ContentKind = 'note' | 'board';

const OverviewMaterialsAddButton = () => {
  const { t } = useTranslation('classroom');
  const navigate = useNavigate();
  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const handleCreate = (contentKind: ContentKind) => {
    if (!classroomId) return;
    addClassroomMaterials.mutate(
      { classroomId, content_kind: contentKind, student_access_mode: 'read_write' },
      {
        onSuccess: (response) => {
          if (contentKind === 'note') {
            navigate({
              to: '/classrooms/$classroomId/notes/$noteId',
              params: { classroomId, noteId: response.data.id },
            });
          } else {
            navigate({
              to: '/classrooms/$classroomId/boards/$boardId',
              params: { classroomId, boardId: response.data.id },
            });
          }
        },
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="primary"
          className={primaryIconButtonClass}
          aria-label={t('tabs.materials')}
          data-umami-event="classroom-overview-add-material"
        >
          <Add className="fill-text-on-accent size-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="border-border-default bg-background-surface flex flex-col gap-1 rounded-2xl border p-2 shadow-lg"
      >
        <DropdownMenuItem
          className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-2"
          onSelect={() => handleCreate('board')}
          data-umami-event="classroom-overview-add-board"
        >
          <WhiteBoard className="fill-icon-primary size-4 shrink-0" />
          <span className="text-s-base text-text-primary font-medium">{t('materials.boards')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-2"
          onSelect={() => handleCreate('note')}
          data-umami-event="classroom-overview-add-note"
        >
          <FileSmall className="fill-icon-primary size-4 shrink-0" />
          <span className="text-s-base text-text-primary font-medium">{t('materials.notes')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const OverviewPaymentsAddButton = ({ onClick }: { onClick: () => void }) => {
  const { t } = useTranslation('classroom');

  return (
    <Button
      type="button"
      variant="primary"
      className={primaryIconButtonClass}
      onClick={onClick}
      aria-label={t('actions.createInvoice')}
      data-umami-event="classroom-overview-create-invoice"
    >
      <Add className="fill-text-on-accent size-6" />
    </Button>
  );
};

const OverviewStudentsAddButton = () => {
  const { t } = useTranslation('classroom');

  return (
    <ModalStudentsGroup>
      <Button
        type="button"
        variant="primary"
        className={primaryIconButtonClass}
        aria-label={t('actions.addStudent')}
        data-umami-event="classroom-overview-add-student"
      >
        <Add className="fill-text-on-accent size-6" />
      </Button>
    </ModalStudentsGroup>
  );
};

export const Overview = () => {
  const { t } = useTranslation('classroom');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const { classroomId } = useParams({ from: '/(app)/_layout/classrooms/$classroomId/' });
  const { data: classroom, isLoading, isError } = useGetClassroom(Number(classroomId));

  if (isLoading) {
    return <OverviewSkeleton numberOfSections={2} />;
  }

  if (isError || !classroom) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <h2 className="text-text-primary text-xl font-medium">{t('errors.loadData')}</h2>
        <p className="text-text-primary">{t('errors.classroomInfo')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pt-2">
      <UpcomingLessonsSection />
      <SectionContainer
        title={t('overview.materials')}
        tabLink="boards"
        actions={isTutor ? <OverviewMaterialsAddButton /> : null}
      >
        <MaterialsList />
      </SectionContainer>
      <SectionContainer
        title={t('overview.payments')}
        tabLink="payments"
        actions={
          isTutor ? <OverviewPaymentsAddButton onClick={() => setInvoiceModalOpen(true)} /> : null
        }
      >
        <PaymentsList />
      </SectionContainer>
      {classroom.kind === 'group' && isTutor && (
        <SectionContainer
          title={t('overview.students')}
          tabLink=""
          actions={<OverviewStudentsAddButton />}
        >
          <StudentsList classroomId={classroomId} />
        </SectionContainer>
      )}
      {invoiceModalOpen && (
        <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} />
      )}
    </div>
  );
};
