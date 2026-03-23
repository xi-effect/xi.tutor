import { Button } from '@xipkg/button';
import { Plus } from '@xipkg/icons';

import { Header } from './Header';
import { TabsComponent } from './TabsComponent';
import { useAddMaterials, useCurrentUser } from 'common.services';
import { ErrorPage } from 'common.ui';
import {
  MaterialsDuplicateProvider,
  useMaterialsDuplicate,
} from '../provider/MaterialsDuplicateContext';
import { MaterialsDuplicate } from 'features.materials.duplicate';
import { useNavigate, useSearch } from '@tanstack/react-router';

const MaterialsPageContent = () => {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const hasValidTab = search.tab === 'notes' || search.tab === 'boards';

  const currentTab = hasValidTab ? (search.tab as 'notes' | 'boards') : 'boards';

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

  const handleCreate = () => {
    if (currentTab === 'notes') {
      addMaterials.mutate(
        { content_kind: 'note' },
        {
          onSuccess: (response) => {
            navigate({
              to: `/materials/$id/$contentKind`,
              params: {
                id: response.data.id,
                contentKind: response.data.content_kind,
              },
            });
          },
        },
      );
    } else if (currentTab === 'boards') {
      addMaterials.mutate(
        { content_kind: 'board' },
        {
          onSuccess: (response) => {
            navigate({
              to: `/materials/$id/$contentKind`,
              params: {
                id: response.data.id,
                contentKind: response.data.content_kind,
              },
            });
          },
        },
      );
    }
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
