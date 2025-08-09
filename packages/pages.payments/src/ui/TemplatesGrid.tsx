import { ScrollArea } from '@xipkg/scrollarea';
import { TemplateCard } from './TemplateCard';
import { useTemplatesList } from 'common.services';
import { PaymentTemplateDataT } from 'common.types';
import { useDeleteTemplate } from 'common.services';
import { AddTemplateButton } from './AddTemplateButton';

export const TemplatesGrid = () => {
  const { data } = useTemplatesList();
  const { mutate: deleteTemplateMutation } = useDeleteTemplate();

  const handleDeleteTemplate = (id: number) => () => {
    deleteTemplateMutation(id);
  };

  return (
    <ScrollArea className="h-[calc(100vh-204px)] w-full p-4 pl-0">
      <ul className="max-xs:gap-4 grid grid-cols-1 gap-8 min-[550px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {data &&
          data.map((template: PaymentTemplateDataT) => (
            <li key={template.id.toString()}>
              <TemplateCard {...template} handleDeleteTemplate={handleDeleteTemplate} />
            </li>
          ))}
        <AddTemplateButton />
      </ul>
    </ScrollArea>
  );
};
