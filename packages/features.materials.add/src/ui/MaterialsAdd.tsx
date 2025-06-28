import { File, Note, Board } from './components';
import { useAddMaterials, type MaterialsDataT } from 'common.services';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

const showError = (status: number | undefined, kind: string, err: AxiosError) => {
  const messageMap: Record<number, string> = {
    422: 'Ошибка валидации данных. Проверьте корректность введенных данных',
    401: 'Необходима авторизация. Пожалуйста, войдите в систему',
  };

  toast.error(messageMap[status!] || `Ошибка при создании ${kind}: ${err.message}`);
  console.log(err.response?.data);
};

export const MaterialsAdd = () => {
  const { addMaterials } = useAddMaterials();

  const handleCreate = async (kind: MaterialsDataT['kind']) => {
    try {
      const response = await addMaterials.mutateAsync({ kind });

      if (response?.status === 201) {
        toast.success(`${response.data.name} создан`);
        console.log(`${kind} создан:`, response.data);
      }
    } catch (error) {
      const err = error as AxiosError;
      const status = err.response?.status;

      if (!status) {
        toast.error(`Сетевая ошибка: ${err.message}`);
        console.log(err);
        return;
      }

      showError(status, kind, err);
    }
  };

  return (
    <div className="ml-auto flex flex-row items-center gap-2">
      <File
        onUpload={() => {
          console.log('file');
        }}
      />

      <Note onCreate={() => handleCreate('note')} />

      <Board onCreate={() => handleCreate('board')} />
    </div>
  );
};
