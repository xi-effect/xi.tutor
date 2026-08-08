/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useMemo } from 'react';
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
import { useCollaborators } from 'modules.editor';
import { CollaboratorAvatars } from './CollaboratorAvatars';
import { getAvatarUrlByUserId } from '../utils';

export const Header = () => {
  const { classroomId, noteId, materialId } = useParams({ strict: false });
  const { collaborators } = useCollaborators();
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

  const materialIdValue = noteId ?? materialId;

  if (!materialIdValue) {
    throw new Error('noteId or materialId must be provided');
  }

  const { data: material, isLoading } = getMaterial({
    classroomId: classroomId || '',
    id: materialIdValue,
    disabled: !materialIdValue,
  });

  const handleBack = () => {
    if (classroomId) {
      router.navigate({ to: '/classrooms/$classroomId', params: { classroomId } });
    } else {
      router.navigate({
        to: '/materials',
        // @ts-ignore
        search: { tab: 'notes' },
      });
    }
  };

  const collaboratorsWithAvatars = useMemo(
    () =>
      collaborators.map((collaborator) => ({
        ...collaborator,
        avatarUrl: getAvatarUrlByUserId(collaborator.id),
        initial: collaborator.userName.charAt(0).toUpperCase(),
      })),
    [collaborators],
  );

  return (
    <div className="bg-background-surface border-border-default sticky top-0 z-50 flex h-[56px] min-h-[56px] w-full rounded-2xl border px-2">
      <div className="flex w-full items-center justify-between">
        <div className="relative flex w-full items-center justify-center gap-2">
          <Button
            variant="none"
            onClick={handleBack}
            type="button"
            className="absolute top-0 left-0 h-10 w-10 p-2"
          >
            <ArrowLeft size="s" className="fill-icon-primary size-6" />
          </Button>
          <div className="w-full max-w-4xl pl-29">
            {isLoading ? (
              <Skeleton variant="text" className="h-6 w-full" />
            ) : (
              <EditableTitle title={material.name} materialId={materialIdValue} isTutor={isTutor} />
            )}
          </div>
          <CollaboratorAvatars collaborators={collaboratorsWithAvatars} currentUserId={user.id} />
        </div>
      </div>
    </div>
  );
};
