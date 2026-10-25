import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { cn, useMediaQuery } from '@xipkg/utils';
import { NotFoundPage } from 'common.ui';
import { useCurrentUser } from 'common.services';
import { useHomeworkLibrary } from '../hooks/useHomeworkLibrary';
import { isHomeworkTab, type HomeworkTab } from '../types';
import { Header } from './Header';
import { HomeworkFeed } from './HomeworkFeed';
import { HomeworkFormModal } from './HomeworkFormModal';

const getTabFromUrl = (): HomeworkTab => {
  if (typeof window === 'undefined') return 'active';
  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab && isHomeworkTab(tab) ? tab : 'active';
};

const replaceTab = (tab: HomeworkTab) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  window.history.replaceState({}, '', url);
};

export const HomeworkPage = () => {
  const { t } = useTranslation('homework');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const isMobile = useMediaQuery('(max-width: 960px)');
  const parentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<HomeworkTab>(() => getTabFromUrl());
  const [createOpen, setCreateOpen] = useState(false);
  const {
    items,
    updateItem,
    createAssignment,
    duplicateItem,
    archiveItem,
    restoreItem,
    createFromTemplate,
  } = useHomeworkLibrary();

  useEffect(() => {
    const syncFromUrl = () => setActiveTab(getTabFromUrl());
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  const handleTabChange = (tabId: string) => {
    if (!isHomeworkTab(tabId)) return;
    replaceTab(tabId);
    setActiveTab(tabId);
  };

  const findItem = (id: string) => items.find((item) => item.id === id);

  if (!isTutor) {
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <>
      <div
        className={cn(
          'bg-background-page flex flex-col gap-8 p-5',
          isMobile ? 'h-full min-h-0 overflow-hidden pb-0' : 'h-screen',
        )}
      >
        <div className="flex w-full shrink-0 items-start justify-between sm:flex-row">
          <Header
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onCreate={() => setCreateOpen(true)}
          />
        </div>

        <div
          ref={parentRef}
          className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain', isMobile && 'pb-4')}
        >
          <HomeworkFeed
            activeTab={activeTab}
            items={items}
            parentRef={parentRef}
            onChange={(id, value) => updateItem(id, value)}
            onDuplicate={(id) => {
              duplicateItem(id);
              toast(t('toast.duplicated'));
            }}
            onArchive={(id) => {
              const item = findItem(id);
              archiveItem(id);
              toast(t(item?.kind === 'template' ? 'toast.templateArchived' : 'toast.archived'));
            }}
            onRestore={(id) => {
              const item = findItem(id);
              restoreItem(id);
              toast(t(item?.kind === 'template' ? 'toast.templateRestored' : 'toast.restored'));
            }}
            onCreateFromTemplate={(id) => {
              createFromTemplate(id);
              handleTabChange('active');
              toast(t('toast.createdFromTemplate'));
            }}
          />
        </div>
      </div>

      <HomeworkFormModal
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={({ title, description }) => {
          createAssignment(title, description);
          setCreateOpen(false);
          handleTabChange('active');
          toast(t('toast.created'));
        }}
      />
    </>
  );
};
