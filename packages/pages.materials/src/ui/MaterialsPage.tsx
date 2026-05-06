import { useEffect, useState } from 'react';
import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';

import { Header } from './Header';
import { TabsComponent } from './TabsComponent';
import { useAddMaterials, useCurrentUser } from 'common.services';
import { DateTimeDisplay, ErrorPage } from 'common.ui';
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
  const { addMaterials } = useAddMaterials();
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

  const navigateToMaterial = (id: string | number, contentKind: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.location.assign(`/materials/${id}/${contentKind}`);
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

  const handleCreate = () => {
    const tab =
      typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('tab');
    const currentTab = tab === 'notes' || tab === 'boards' ? tab : 'boards';

    if (currentTab === 'notes') {
      addMaterials.mutate(
        { content_kind: 'note' },
        {
          onSuccess: (response) => {
            navigateToMaterial(response.data.id, response.data.content_kind);
          },
        },
      );
    } else if (currentTab === 'boards') {
      addMaterials.mutate(
        { content_kind: 'board' },
        {
          onSuccess: (response) => {
            navigateToMaterial(response.data.id, response.data.content_kind);
          },
        },
      );
    }
  };

  return (
    <>
      <div className="bg-gray-5 flex h-screen flex-col justify-between gap-6 pr-0">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col gap-5 px-5 pt-5">
            <div className="flex h-8 items-center">
              <DateTimeDisplay />
            </div>
            <Header activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          <TabsComponent activeTab={activeTab} />
        </div>

        <div className="xs:hidden flex flex-row items-center justify-end">
          <Button
            size="small"
            className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
            data-umami-event="materials-create-material"
            onClick={handleCreate}
          >
            <Plus className="fill-brand-0" />
          </Button>
        </div>
      </div>

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
