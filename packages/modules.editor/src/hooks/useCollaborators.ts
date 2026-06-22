import { useCollaboratorsStore } from '../store/collaboratorsStore';

export const useCollaborators = () => {
  const collaborators = useCollaboratorsStore((s) => s.collaborators);
  const setCollaborators = useCollaboratorsStore((s) => s.setCollaborators);
  const setCollaboratorsIfChanged = useCollaboratorsStore((s) => s.setCollaborators);
  const reset = useCollaboratorsStore((s) => s.reset);

  return { collaborators, setCollaborators, setCollaboratorsIfChanged, reset };
};
