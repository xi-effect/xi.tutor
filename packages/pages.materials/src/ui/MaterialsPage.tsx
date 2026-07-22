import { useEffect, useState } from 'react';

import { Header } from './Header';
import { MobileTutorActionButton } from 'features.invites';
import { TabsComponent } from './TabsComponent';
import { useCurrentUser } from 'common.services';
import { DateTimeDisplay, ErrorPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { cn, useMediaQuery } from '@xipkg/utils';

const getTabFromUrl = (): 'notes' | 'boards' => {
  if (typeof window === 'undefined') {
    return 'boards';
  }

  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab === 'notes' || tab === 'boards' ? tab : 'boards';
};

const MaterialsPageContent = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'boards'>(() => getTabFromUrl());
  const isMobile = useMediaQuery('(max-width: 960px)');

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { materialId, open, closeModal } = useMaterialsDuplicate();

  useEffect(() => {
    const syncTabFromUrl = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener('popstate', syncTabFromUrl);
    return () => {
      window.removeEventListener('popstate', syncTabFromUrl);
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    if (tabId !== 'notes' && tabId !== 'boards') {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    window.history.replaceState({}, '', url);
    setActiveTab(tabId);
  };

  if (!isTutor) {
    return (
      <ErrorPage
        withLogo={false}
        title="Ошибка"
        errorCode={403}
        text="Вы не имеете доступа к этой странице"
      />
    );
  }

  return (
    <>
      <div
        className={cn(
          'bg-gray-5 flex h-full flex-col gap-5',
          isMobile && 'max-h-[calc(100dvh-64px)]',
        )}
      >
        <div className="flex flex-col gap-5 px-5 pt-5">
          <DateTimeDisplay />
          <Header activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div
          className={cn(
            'min-h-0 flex-1 overflow-auto pr-4 pl-5',
            isMobile && 'h-[calc(100dvh-168px)]',
          )}
        >
          <TabsComponent activeTab={activeTab} />
        </div>
      </div>

      <MobileTutorActionButton variant="materials" />

      {materialId !== null && (
        <MaterialsDuplicate
          materialId={materialId}
          open={open}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              closeModal();
            }
          }}
        />
      )}
    </>
  );
};

export const MaterialsPage = () => {
  return (
    <MaterialsDuplicateProvider>
      <MaterialsPageContent />
    </MaterialsDuplicateProvider>
  );
};
