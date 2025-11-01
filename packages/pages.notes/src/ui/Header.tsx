/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useParams, useSearch } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { EditableTitle } from './EditableTitle';

export const Header = () => {
  const { noteId = 'empty' } = useParams({ strict: false });

  // @ts-ignore
  const { classroom } = useSearch({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getMaterial = (() => {
    if (classroom) {
      if (isTutor) {
        return useGetClassroomMaterial;
      } else {
        return useGetClassroomMaterialStudent;
      }
    }

    return useGetMaterial;
  })();

  const { data: material, isLoading } = getMaterial({
    classroomId: classroom || '',
    id: noteId,
    disabled: !noteId,
  });

  return (
    <div className="bg-gray-0 text-xl-base z-50 w-full">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center justify-start gap-2 px-4">
          {isLoading ? (
            <Skeleton variant="text" height="48px" className="w-full" />
          ) : (
            <EditableTitle title={material.name} materialId={noteId} />
          )}
        </div>
      </div>
    </div>
  );
};
