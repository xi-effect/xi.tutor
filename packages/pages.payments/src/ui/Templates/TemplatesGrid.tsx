import { ScrollArea } from '@xipkg/scrollarea';
import { TemplateCard } from './TemplateCard';
import { useTemplatesList } from 'common.services';
import { TemplateT } from 'common.types';
import { useDeleteTemplate } from 'common.services';

export const TemplatesGrid = () => {
  const { data } = useTemplatesList();
  const { mutate: deleteTemplateMutation } = useDeleteTemplate();

  const handleDeleteTemplate = (id: number) => () => {
    deleteTemplateMutation(id);
  };

  return (
    <ScrollArea className="h-[calc(100dvh-140px)] w-full px-5 pb-5 sm:px-10 sm:pb-10">
      <ul className="grid grid-cols-1 gap-5 min-[550px]:grid-cols-2 md:grid-cols-3">
        {data?.map((template: TemplateT) => (
          <li key={template.id} className="min-w-0">
            <TemplateCard {...template} handleDeleteTemplate={handleDeleteTemplate} />
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
};
