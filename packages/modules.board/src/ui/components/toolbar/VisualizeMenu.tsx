import { useCallback, useState } from 'react';
import { track, useEditor } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { ArrowRight } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  VISUALIZE_DIRECT_ACTION_CONFIDENCE,
  BOARD_VISUALIZE_ENABLED,
} from '../../../visualize/constants';
import { getMathGraphExpressions } from '../../../visualize/mapMathIntent';
import {
  applyVisualizationSuggestion,
  getVisualizationSuggestionsForSelection,
  type VisualizationSuggestion,
} from '../../../visualize';
import { boardDrawerRowClass } from '../shared';
import {
  boardIconClass,
  boardMenuItemClass,
  boardMenuSurfaceClass,
  boardSelectionToolbarButtonClass,
} from '../../boardTheme';

function needsPreview(suggestion: VisualizationSuggestion): boolean {
  if (suggestion.intent.type === 'function_graph') {
    return getMathGraphExpressions(suggestion.intent).length > 1;
  }
  return suggestion.intent.type === 'geometry' || suggestion.intent.type === 'diagram';
}

function isDirectAction(suggestions: VisualizationSuggestion[]): VisualizationSuggestion | null {
  if (suggestions.length !== 1) return null;
  const [suggestion] = suggestions;
  if (!suggestion || suggestion.confidence <= VISUALIZE_DIRECT_ACTION_CONFIDENCE) return null;
  return suggestion;
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path
        d="M10 1.5l1.4 5.2L16.5 8 11.4 9.3 10 14.5 8.6 9.3 3.5 8l5.1-1.3L10 1.5zM15.5 12l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function applySuggestion(
  editor: ReturnType<typeof useEditor>,
  suggestion: VisualizationSuggestion,
  t: (key: string) => string,
) {
  const result = applyVisualizationSuggestion(editor, suggestion);
  if (!result.ok) {
    toast.error(t('visualize.failed'));
  }
}

export const VisualizeSelectionButton = track(function VisualizeSelectionButton() {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const [preview, setPreview] = useState<VisualizationSuggestion | null>(null);
  const suggestions = BOARD_VISUALIZE_ENABLED
    ? getVisualizationSuggestionsForSelection(editor)
    : [];

  const handleApply = useCallback(
    (suggestion: VisualizationSuggestion) => {
      if (needsPreview(suggestion)) {
        setPreview(suggestion);
        return;
      }
      applySuggestion(editor, suggestion, t);
    },
    [editor, t],
  );

  const handleConfirmPreview = useCallback(() => {
    if (!preview) return;
    applySuggestion(editor, preview, t);
    setPreview(null);
  }, [editor, preview, t]);

  if (!BOARD_VISUALIZE_ENABLED) return null;

  const direct = isDirectAction(suggestions);
  const buttonTitle = direct?.label ?? t('visualize.action');

  if (suggestions.length === 0) {
    return (
      <Button
        variant="none"
        size="s"
        className={boardSelectionToolbarButtonClass}
        title={buttonTitle}
        data-umami-event="board-visualize-empty"
        onClick={() => toast.error(t('visualize.failed'))}
      >
        <SparkleIcon className="text-text-primary size-5 shrink-0" />
      </Button>
    );
  }

  if (direct && !needsPreview(direct)) {
    return (
      <Button
        variant="none"
        size="s"
        className={boardSelectionToolbarButtonClass}
        title={buttonTitle}
        data-umami-event="board-visualize-apply"
        data-umami-event-type={direct.intent.type}
        onClick={() => applySuggestion(editor, direct, t)}
      >
        <SparkleIcon className="text-text-primary size-5 shrink-0" />
      </Button>
    );
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setPreview(null);
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          size="s"
          className={boardSelectionToolbarButtonClass}
          title={buttonTitle}
          data-umami-event="board-visualize-open"
        >
          <SparkleIcon className="text-text-primary size-5 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        sideOffset={8}
        className={cn(boardMenuSurfaceClass, 'flex w-64 flex-col gap-1 rounded-xl p-1')}
      >
        {preview ? (
          <div className="flex flex-col gap-2 px-3 py-2">
            <p className="text-text-secondary text-xs">{t('visualize.found')}</p>
            <p className="text-text-primary text-sm font-medium whitespace-pre-wrap">
              {preview.summary}
            </p>
            <div className="flex gap-2 pt-1">
              <Button size="s" onClick={handleConfirmPreview}>
                {t('visualize.build')}
              </Button>
              <Button size="s" variant="ghost" onClick={() => setPreview(null)}>
                {t('visualize.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <DropdownMenuItem
              key={`${suggestion.intent.type}-${suggestion.summary}`}
              className={cn(
                boardMenuItemClass,
                'flex flex-col items-start gap-0.5 rounded-lg px-3 py-2',
              )}
              onClick={() => handleApply(suggestion)}
              data-umami-event="board-visualize-apply"
              data-umami-event-type={suggestion.intent.type}
            >
              <span>{suggestion.label}</span>
              <span className="text-text-secondary line-clamp-2 text-xs whitespace-pre-wrap">
                {suggestion.summary}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export function VisualizeMoreMenuItems() {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const suggestions = getVisualizationSuggestionsForSelection(editor);

  if (!BOARD_VISUALIZE_ENABLED) return null;

  if (suggestions.length === 0) {
    return (
      <DropdownMenuItem
        className={cn(boardMenuItemClass, 'rounded-lg px-3')}
        onClick={() => toast.error(t('visualize.failed'))}
      >
        <SparkleIcon className={`mr-2 size-4 ${boardIconClass}`} />
        {t('visualize.action')}
      </DropdownMenuItem>
    );
  }

  return (
    <>
      {suggestions.map((suggestion) => (
        <DropdownMenuItem
          key={`${suggestion.intent.type}-${suggestion.summary}`}
          className={cn(boardMenuItemClass, 'rounded-lg px-3')}
          onClick={() => applyVisualizationSuggestion(editor, suggestion)}
        >
          <SparkleIcon className={`mr-2 size-4 ${boardIconClass}`} />
          {suggestion.label}
        </DropdownMenuItem>
      ))}
    </>
  );
}

export function VisualizeMobileRows({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('board');
  const editor = useEditor();
  const suggestions = getVisualizationSuggestionsForSelection(editor);

  if (!BOARD_VISUALIZE_ENABLED) return null;

  if (suggestions.length === 0) {
    return (
      <button
        type="button"
        className={boardDrawerRowClass}
        onClick={() => {
          toast.error(t('visualize.failed'));
          onDone();
        }}
      >
        <span className="text-text-primary min-w-0 flex-1 text-left text-sm font-medium">
          {t('visualize.action')}
        </span>
      </button>
    );
  }

  return (
    <>
      {suggestions.map((suggestion) => (
        <button
          key={`${suggestion.intent.type}-${suggestion.summary}`}
          type="button"
          className={boardDrawerRowClass}
          onClick={() => {
            applyVisualizationSuggestion(editor, suggestion);
            onDone();
          }}
        >
          <span className="text-text-primary min-w-0 flex-1 text-left text-sm font-medium">
            {suggestion.label}
            <span className="text-text-secondary mt-0.5 block truncate text-xs">
              {suggestion.summary}
            </span>
          </span>
          <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
        </button>
      ))}
    </>
  );
}
