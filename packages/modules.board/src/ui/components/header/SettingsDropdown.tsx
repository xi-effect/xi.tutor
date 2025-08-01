import { MoreVert, File } from '@xipkg/icons';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { useEditor } from 'tldraw';
import { toast } from 'sonner';
import { useParams } from '@tanstack/react-router';
import { useGetMaterial } from 'common.services';

export const SettingsDropdown = () => {
  const editor = useEditor();
  const { boardId = 'empty' } = useParams({ strict: false });
  const { data } = useGetMaterial(boardId);

  const saveCanvas = async () => {
    if (!editor) return;

    try {
      toast.info('Начинаем экспорт доски...');

      // Получаем все ID фигур на текущей странице
      const shapeIds = editor.getCurrentPageShapeIds();

      if (shapeIds.size === 0) {
        toast.error('На доске нет элементов для экспорта');
        return;
      }

      // Экспортируем в PNG используя правильный API tldraw
      const { blob } = await editor.toImage([...shapeIds], {
        format: 'png',
        background: true,
        scale: 2,
        padding: 20,
      });

      // Создаем ссылку для скачивания с названием доски
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = data?.name ? `${data.name}.png` : `board-${Date.now()}.png`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Доска успешно экспортирована!');
    } catch (error) {
      console.error('Ошибка при экспорте доски:', error);
      toast.error('Ошибка при экспорте доски');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-[40px] w-[40px] p-2">
          <MoreVert size="s" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex w-[250px] flex-col gap-1 px-2 py-1">
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex gap-2 p-1" onClick={saveCanvas}>
            <File />
            <span>Скачать</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
