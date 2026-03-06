import { MaterialsAdd } from 'features.materials.add';

export const Header = () => {
  return (
    <div className="flex flex-row items-center pt-6 pr-6 pb-4 pl-4">
      <h1 className="text-2xl font-semibold text-gray-100">Материалы</h1>

      <MaterialsAdd onlyDrafts />
    </div>
  );
};
