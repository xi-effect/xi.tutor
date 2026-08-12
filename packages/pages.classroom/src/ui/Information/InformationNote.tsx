import { Button } from '@xipkg/button';
import { ClassroomT } from 'common.api';
import { useAddNoteStorageItem } from 'common.services';
import { StorageItemT } from 'common.types';
import { Editor } from 'modules.editor';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

const InformationNoteContent = ({ note }: { note: StorageItemT }) => {
  return (
    <div className="w-full min-w-0 pl-12 [&_.xi-editor]:px-0 [&_.xi-editor]:py-2">
      <Editor storageItem={note} />
    </div>
  );
};

const InformationNoteCreate = ({ classroom }: { classroom: ClassroomT }) => {
  const { t } = useTranslation('classroom');
  const { addNoteStorageItem } = useAddNoteStorageItem();

  const handleCreateNote = () => {
    addNoteStorageItem.mutate({
      classroomId: classroom.id.toString(),
    });
  };

  const notePlaceholder = t('information.notePlaceholder');

  return (
    <Button
      onClick={handleCreateNote}
      variant="none"
      className="text-text-disabled dark:text-text-secondary h-auto min-h-[128px] w-full py-2 text-left text-base font-normal whitespace-normal"
    >
      {notePlaceholder.split('\n').map((line, index) => (
        <Fragment key={index}>
          {index > 0 ? <br /> : null}
          {line}
        </Fragment>
      ))}
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
