import { useEffect, useState } from 'react';

import { Header } from './Header';
import { MobileTutorActionButton } from 'features.invites';
import { TabsComponent } from './TabsComponent';
import { useCurrentUser } from 'common.services';
import { NotFoundPage } from 'common.ui';
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
    return <NotFoundPage withLogo={false} />;
  }

  return (
    <>
      <div
        className={cn(
          'bg-background-page flex flex-col gap-4',
          isMobile ? 'max-h-[calc(100dvh-64px)]' : 'h-screen',
        )}
      >
        <div className="flex w-full shrink-0 items-start justify-between px-5 pt-4 sm:flex-row sm:px-8 sm:pt-8 md:px-10 md:pt-10">
          <Header activeTab={activeTab} onTabChange={handleTabChange} />
        </div>

        <div
          className={cn(
            'h-full overflow-y-auto px-5 pb-5 sm:mt-10 sm:pr-5 sm:pl-8 md:pr-8 md:pl-10',
            !isMobile && 'flex-1',
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
