import { memo, useCallback, useMemo, type SyntheticEvent } from 'react';
import { Editor } from '@tiptap/core';
import { Button } from '@xipkg/button';
import { ChevronBottom, Code, File, Image } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { useActiveBlockKey, useBlockMenuActions, useYjsContext } from '../../hooks';
import { getTopLevelBlock } from '../../utils/getCurrentBlock';
import { pickAndInsertComputerFiles } from '../../utils/pickAndInsertComputerFiles';
import { ActiveBlockT, BlockTypeT } from '../../types';
import {
  BLOCK_OP_ACTIONS,
  INSERT_BLOCK_ACTIONS,
  type BlockOpKey,
  type IconComponent,
} from '../../config/blockActions';

type NotesEditorToolbarPropsT = {
  editor: Editor;
  /** Высота клавиатуры (0, когда клавиатуры нет). */
  bottom: number;
};

/** Зазор между панелью и клавиатурой/нижней панелью навигации. */
const TOOLBAR_BOTTOM_GAP_PX = 8;

const iconClass = 'fill-icon-primary size-6 shrink-0';

/**
 * Тап по кнопке тулбара не должен уводить фокус из редактора (иначе закроется
 * клавиатура и панель размонтируется). Оба обработчика намеренно: pointerdown
 * покрывает мышь и тач в браузерах с Pointer Events, mousedown — подстраховка
 * на случай расхождений в мобильном Safari (не проверяли живьём). Гейтим по
 * кнопке, чтобы не мешать горизонтальному скроллу ленты.
 */
const keepEditorFocus = (event: SyntheticEvent<HTMLDivElement>) => {
  if ((event.target as HTMLElement).closest('button')) event.preventDefault();
};

const toolbarButtonClass =
  'size-9 shrink-0 rounded-lg p-0 transition-colors hover:bg-background-page active:bg-background-subtle';

type ToolbarIconButtonProps = {
  label: string;
  Icon: IconComponent;
  onClick: () => void;
  isActive?: boolean;
};

const ToolbarIconButton = memo(function ToolbarIconButton({
  label,
  Icon,
  onClick,
  isActive = false,
}: ToolbarIconButtonProps) {
  return (
    <Button
      variant="none"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(toolbarButtonClass, isActive && 'bg-status-info-background')}
    >
      <Icon className={cn(iconClass, isActive && 'fill-icon-brand')} />
    </Button>
  );
});

type InsertActionButtonProps = {
  type: BlockTypeT;
  label: string;
  Icon: IconComponent;
  isActive: boolean;
  onInsert: (type: BlockTypeT) => void;
};

const InsertActionButton = memo(function InsertActionButton({
  type,
  label,
  Icon,
  isActive,
  onInsert,
}: InsertActionButtonProps) {
  const handleClick = useCallback(() => onInsert(type), [onInsert, type]);
  return <ToolbarIconButton label={label} Icon={Icon} isActive={isActive} onClick={handleClick} />;
});

/**
 * Панель инструментов редактора для мобильных. На тач-устройствах
 * DragHandle недоступен, поэтому вставка/операции над блоком живут здесь.
 * Список действий — общий с BlockMenu (../../config/blockActions); картинка/файл здесь
 * ведут сразу «с компьютера» (без подменю «из облака / по ссылке»). Код — не в
 * INSERT_BLOCK_ACTIONS: у него отдельная команда (insertCode), а не insertBlock(type) —
 * 'code' не входит в BlockTypeT.
 * Активный блок — блок верхнего уровня под курсором (getTopLevelBlock).
 *
 * keepEditorFocus на контейнере (mousedown + pointerdown) — тап по кнопке не уводит
 * фокус из редактора; плюс MobileEditorControls держит панель ещё ~250мс после blur.
 */
export const NotesEditorToolbar = ({ editor, bottom }: NotesEditorToolbarPropsT) => {
  const { t } = useTranslation('editor');
  const { storageItem } = useYjsContext();

  const getActiveBlock = useCallback(
    (): ActiveBlockT | undefined => getTopLevelBlock(editor) ?? undefined,
    [editor],
  );

  const { insertBlock, insertCode, duplicate, moveUp, moveDown, remove } = useBlockMenuActions(
    editor,
    getActiveBlock,
  );

  const opHandlers = useMemo<Record<BlockOpKey, () => void>>(
    () => ({ duplicate, moveUp, moveDown, delete: remove }),
    [duplicate, moveUp, moveDown, remove],
  );

  const activeBlockKey = useActiveBlockKey(editor);

  const pickFile = useCallback(
    (mode: 'image' | 'file') =>
      pickAndInsertComputerFiles(editor, storageItem.content_token, getActiveBlock(), mode),
    [editor, storageItem.content_token, getActiveBlock],
  );

  const handleCodeClick = useCallback(() => insertCode(''), [insertCode]);
  const handleImageClick = useCallback(() => pickFile('image'), [pickFile]);
  const handleFileClick = useCallback(() => pickFile('file'), [pickFile]);
  const handleHideKeyboard = useCallback(() => editor.commands.blur(), [editor]);

  return (
    <div
      className="border-border-default bg-background-surface pointer-events-auto fixed inset-x-4 z-40 mx-auto flex max-w-2xl items-center gap-1 rounded-2xl border p-2 shadow-sm"
      style={{
        bottom: `calc(max(${bottom}px, var(--calls-layout-bottom-offset, 0px)) + ${TOOLBAR_BOTTOM_GAP_PX}px)`,
      }}
      onMouseDown={keepEditorFocus}
      onPointerDown={keepEditorFocus}
    >
      <div
        className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {INSERT_BLOCK_ACTIONS.map(({ type, labelKey, Icon }) => (
          <InsertActionButton
            key={type}
            type={type}
            label={t(labelKey)}
            Icon={Icon}
            isActive={activeBlockKey === type}
            onInsert={insertBlock}
          />
        ))}
        <ToolbarIconButton
          label={t('blockMenu.insertCode')}
          Icon={Code}
          isActive={activeBlockKey === 'code'}
          onClick={handleCodeClick}
        />
        <ToolbarIconButton label={t('blockMenu.image')} Icon={Image} onClick={handleImageClick} />
        <ToolbarIconButton label={t('blockMenu.file')} Icon={File} onClick={handleFileClick} />

        <span className="bg-border-default h-4 w-px shrink-0" />

        {BLOCK_OP_ACTIONS.map(({ key, labelKey, Icon }) => (
          <ToolbarIconButton key={key} label={t(labelKey)} Icon={Icon} onClick={opHandlers[key]} />
        ))}
      </div>

      <span className="bg-border-default h-6 w-px shrink-0" />

      <Button
        variant="none"
        aria-label={t('mobileToolbar.hideKeyboard')}
        onClick={handleHideKeyboard}
        className={toolbarButtonClass}
      >
        <ChevronBottom className={iconClass} />
      </Button>
    </div>
  );
};
