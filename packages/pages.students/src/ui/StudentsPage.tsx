import { useRef, useState } from 'react';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import { cn, useMediaQuery } from '@xipkg/utils';
import { NotFoundPage } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { ModalInvitation } from 'features.invites';
import { useTranslation } from 'react-i18next';
import { StudentsList } from './StudentsList';
import { StudentsSearchField } from './StudentsSearchField';

export const StudentsPage = () => {
  const { t } = useTranslation('studentsList');
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');
  const parentRef = useRef<HTMLDivElement>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isUserLoading && !isTutor) {
    return <NotFoundPage />;
  }

  return (
    <div
      className={cn(
        'bg-background-page flex flex-col gap-4 p-5',
        isMobile ? 'h-full min-h-0 overflow-hidden pb-0' : 'h-screen',
      )}
    >
      <div className="flex w-full shrink-0 flex-col gap-4">
        <div className="flex w-full flex-col items-start justify-between gap-3 sm:flex-row">
          <h1 className="font-playfair text-text-primary pb-2 text-2xl font-medium sm:text-4xl">
            {t('title')}
          </h1>
          <div className="flex items-end">
            <Button
              type="button"
              variant="primary"
              className="!h-auto gap-2 rounded-[10px] px-5 py-3 text-base leading-5 font-medium"
              onClick={() => setInviteOpen(true)}
              data-umami-event="students-list-invite"
            >
              <Plus className="fill-text-on-accent size-4 shrink-0" />
              {t('inviteStudent')}
            </Button>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <StudentsSearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('search')}
          />
          {searchQuery.trim() ? (
            <Button
              type="button"
              variant="ghost"
              className="text-s-base text-text-link hover:text-text-link h-auto px-2 py-1 font-medium"
              onClick={() => setSearchQuery('')}
              data-umami-event="students-list-reset-search"
            >
              {t('resetAll')}
            </Button>
          ) : null}
        </div>
      </div>
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <StudentsList
          parentRef={parentRef}
          enabled={Boolean(isTutor)}
          searchQuery={searchQuery}
          onInviteStudent={() => setInviteOpen(true)}
        />
      </div>
      <ModalInvitation open={inviteOpen} onOpenChange={setInviteOpen} analyticsSource="students" />
    </div>
  );
};
