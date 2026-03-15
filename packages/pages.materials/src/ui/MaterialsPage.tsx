import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';
import * as React from 'react';

import { Header } from './Header';
import { TabsComponent } from './TabsComponent';
import { useCurrentUser } from 'common.services';
import { ErrorPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { MaterialsDuplicate } from 'features.materials.duplicate';

const MaterialsPageContent = () => {
  const [activeTab, setActiveTab] = React.useState('boards');
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const { materialId, open, closeModal } = useMaterialsDuplicate();

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
      <div className="bg-gray-5 flex h-screen flex-col justify-between gap-6 pl-4">
        <div className="flex flex-col">
          <Header activeTab={activeTab} onTabChange={setActiveTab} />
          <TabsComponent activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="xs:hidden flex flex-row items-center justify-end">
          <Button
            size="small"
            className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
            data-umami-event="materials-create-material"
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
