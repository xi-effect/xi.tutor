import { CardMaterials, type CardMaterialsProps } from '../CardMaterials';

export const MaterialsList = ({
  materials,
}: {
  materials: CardMaterialsProps['accessTypes'][];
}) => {
  return (
    <div className="flex flex-row gap-8 pb-4">
      {materials.map((material) => (
        <CardMaterials key={material?.id} accessTypes={material} />
      ))}
    </div>
  );
};
