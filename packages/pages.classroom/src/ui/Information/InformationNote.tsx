import { Button } from '@xipkg/button';
import { ClassroomT } from 'common.api';
import { useAddNoteStorageItem } from 'common.services';
import { StorageItemT } from 'common.types';
import { Editor } from 'modules.editor';

const InformationNoteContent = ({ note }: { note: StorageItemT }) => {
  return <Editor storageItem={note} />;
};

const InformationNoteCreate = ({ classroom }: { classroom: ClassroomT }) => {
  const { addNoteStorageItem } = useAddNoteStorageItem();

  const handleCreateNote = () => {
    addNoteStorageItem.mutate({
      classroomId: classroom.id.toString(),
    });
  };

  return (
    <Button onClick={handleCreateNote} variant="none" className="m-6 h-[128px] w-full">
      Это место для заметок к кабинету. Можно вести план занятий,
      <br />
      хранить контакты родителей ученика. Нажмите, чтобы начать редактировать
    </Button>
  );
};

type InformationNoteProps = {
  classroom: ClassroomT;
  note?: StorageItemT;
};

export const InformationNote = ({ classroom, note }: InformationNoteProps) => {
  if (note) {
    return <InformationNoteContent note={note} />;
  }

  return <InformationNoteCreate classroom={classroom} />;
};
