import { useEffect, useState } from 'react';

import { Header } from './Header';
import { MobileTutorActionButton } from 'features.invites';
import { TabsComponent } from './TabsComponent';
import { useCurrentUser } from 'common.services';
import { ErrorPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { MaterialsDuplicate } from 'features.materials.duplicate';

const getTabFromUrl = (): 'notes' | 'boards' => {
  if (typeof window === 'undefined') {
    return 'boards';
  }

  const tab = new URLSearchParams(window.location.search).get('tab');
  return tab === 'notes' || tab === 'boards' ? tab : 'boards';
};

const MaterialsPageContent = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'boards'>(() => getTabFromUrl());
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
      <div className="bg-background-page flex h-screen flex-col justify-between gap-6 pr-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col px-5 pt-5">
            <Header activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
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
