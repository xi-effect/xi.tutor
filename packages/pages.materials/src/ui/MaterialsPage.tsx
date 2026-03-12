import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';

import { Header } from './Header';
import { TabsComponent } from './TabsComponent';
import { useAddMaterials, useCurrentUser, type MaterialsDataT } from 'common.services';
import { ErrorPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { useNavigate } from '@tanstack/react-router';

const MaterialsPageContent = () => {
  const { addMaterials } = useAddMaterials();
  const navigate = useNavigate();
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

  const handleCreate = (kind: MaterialsDataT['content_kind']) => {
    addMaterials.mutate(
      { content_kind: kind },
      {
        onSuccess: (response) => {
          navigate({
            to: `/materials/${response.data.id}/${response.data.content_kind}`,
          });
        },
      },
    );
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-6 pl-4">
        <div className="flex flex-col pt-1">
          <Header />
          <TabsComponent />
        </div>

        <div className="xs:hidden flex flex-row items-center justify-end">
          <Button
            size="small"
            className="fixed right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl"
            data-umami-event="materials-create-material"
            onClick={() => handleCreate('board')}
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
