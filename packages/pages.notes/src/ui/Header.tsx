/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useParams, useRouter } from '@tanstack/react-router';
import {
  useCurrentUser,
  useGetClassroomMaterial,
  useGetClassroomMaterialStudent,
  useGetMaterial,
} from 'common.services';
import { Skeleton } from 'common.ui';
import { EditableTitle } from './EditableTitle';
import { Button } from '@xipkg/button';
import { ArrowLeft } from '@xipkg/icons';

export const Header = () => {
  const { classroomId, noteId, editorId, materialId } = useParams({ strict: false });
  const router = useRouter();

  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';

  const getMaterial = (() => {
    if (classroomId) {
      if (isTutor) {
        return useGetClassroomMaterial;
      } else {
        return useGetClassroomMaterialStudent;
      }
    }

    return useGetMaterial;
  })();

  const materialIdValue = noteId ?? editorId ?? materialId;

  if (!materialIdValue) {
    throw new Error('noteId or editorId or materialId must be provided');
  }

  const { data: material, isLoading } = getMaterial({
    classroomId: classroomId || '',
    id: materialIdValue,
    disabled: !materialIdValue,
  });

  const handleBack = () => {
    router.history.back();
  };

  return (
    <div className="bg-gray-0 text-xl-base z-50 w-full">
      <div className="flex items-center justify-between">
        <div className="flex w-full items-center justify-start gap-2 px-16">
          <Button variant="ghost" onClick={handleBack} type="button" className="h-10 w-10 p-2">
            <ArrowLeft size="s" />
          </Button>
          {isLoading ? (
            <Skeleton variant="text" className="h-6 w-full" />
          ) : (
            <EditableTitle title={material.name} materialId={materialIdValue} />
          )}
        </div>
      </div>
    </div>
  );
};
