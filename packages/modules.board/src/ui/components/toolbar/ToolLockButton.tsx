import { track, useEditor, useValue } from '@ibodr/draw';
import { Locked, Unlocked } from '@xipkg/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@xipkg/tooltip';
import { useTranslation } from 'react-i18next';
import { boardToolbarIconClass } from '../../boardTheme';
import { NavbarButton } from '../shared';

export const ToolLockButton = track(function ToolLockButton() {
  const editor = useEditor();
  const { t } = useTranslation('board');
  const isLocked = useValue('board-tool-lock', () => editor.getInstanceState().isToolLocked, [
    editor,
  ]);

  const toggle = () => {
    editor.updateInstanceState({ isToolLocked: !editor.getInstanceState().isToolLocked });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavbarButton
            icon={
              isLocked ? (
                <Locked className={boardToolbarIconClass} />
              ) : (
                <Unlocked className={boardToolbarIconClass} />
              )
            }
            title={t(isLocked ? 'navbar.toolLockOn' : 'navbar.toolLock')}
            isActive={isLocked}
            data-board-tool="tool-lock"
            aria-pressed={isLocked}
            onClick={toggle}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t(isLocked ? 'navbar.toolLockOn' : 'navbar.toolLock')}</p>
          <p className="mt-1 max-w-56 text-xs opacity-80">
            {t(isLocked ? 'navbar.toolLockOnHint' : 'navbar.toolLockHint')}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
