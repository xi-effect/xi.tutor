import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@xipkg/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@xipkg/popover';
import { TCollaborator } from '../types';

type TCollaboratorAvatars = {
  collaborators: TCollaborator[];
  currentUserId: number;
};

const MAX_VISIBLE_AVATARS = 3;

export const CollaboratorAvatars = ({ collaborators, currentUserId }: TCollaboratorAvatars) => {
  const overflowCount = Math.max(0, collaborators.length - MAX_VISIBLE_AVATARS);
  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_AVATARS);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="cursor-pointer border-none bg-transparent p-0">
          <AvatarGroup>
            {visibleCollaborators.map((collaborator) => (
              <Avatar key={collaborator.id} size="s">
                {collaborator.avatarUrl && <AvatarImage src={collaborator.avatarUrl} size="s" />}
                <AvatarFallback size="s">{collaborator.initial}</AvatarFallback>
              </Avatar>
            ))}
            {overflowCount > 0 && <AvatarGroupCount>+{overflowCount}</AvatarGroupCount>}
          </AvatarGroup>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={12}
        className="z-100 w-64 rounded-xl p-2"
      >
        <div className="flex flex-col gap-1">
          <p className="text-gray-60 px-2 py-1 text-xs">Участники в заметке</p>
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="hover:bg-gray-5 flex items-center gap-2 rounded-lg px-2 py-1.5"
            >
              <Avatar size="s">
                {collaborator.avatarUrl && <AvatarImage src={collaborator.avatarUrl} size="s" />}
                <AvatarFallback size="s">{collaborator.initial}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-sm text-gray-100">
                {collaborator.id === currentUserId ? 'Вы' : collaborator.userName}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
