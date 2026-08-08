import { useAddClassroomMaterials } from 'common.services';

export const useCallsAddClassroomMaterials = () => {
  const { addClassroomMaterials } = useAddClassroomMaterials();

  const addClassroomMaterialsPort = (
    params: Parameters<typeof addClassroomMaterials.mutateAsync>[0],
  ) => addClassroomMaterials.mutateAsync(params);

  return {
    addClassroomMaterials: new Proxy(addClassroomMaterialsPort, {
      get(_target, prop) {
        if (prop === 'isPending') return addClassroomMaterials.isPending;

        const value = (addClassroomMaterials as Record<string | symbol, unknown>)[prop];
        return typeof value === 'function'
          ? (value as (...args: unknown[]) => unknown).bind(addClassroomMaterials)
          : value;
      },
    }),
  };
};
