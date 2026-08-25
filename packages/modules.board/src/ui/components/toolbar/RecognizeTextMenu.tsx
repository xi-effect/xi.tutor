import { useCallback, useMemo } from 'react';
import { useParams } from '@tanstack/react-router';
import { useEditor, type DrShapeId } from '@ibodr/draw';
import { Button } from '@xipkg/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@xipkg/dropdown';
import { ArrowRight, Loader, TText } from '@xipkg/icons';
import { cn } from '@xipkg/utils';
import { useCurrentUser, useGetClassroom, useGetClassroomStudent } from 'common.services';
import { useTranslation } from 'react-i18next';
import {
  inferOcrLanguageFromSubject,
  inferOcrLanguageFromUiLocale,
  OCR_LANGUAGES,
  recognizeBoardImageText,
  resolveOcrLanguage,
  useOcrPreferencesStore,
  useOcrProcessingStore,
  type OcrLanguage,
  type OcrLanguageChoice,
} from '../../../ocr';
import {
  boardDropdownZClass,
  boardIconClass,
  boardMenuItemClass,
  boardMenuSubTriggerClass,
  boardMenuSurfaceClass,
} from '../../boardTheme';
import { boardDrawerRowClass } from '../shared';

const LANGUAGE_CHOICES: OcrLanguageChoice[] = ['auto', ...OCR_LANGUAGES];

function useContextualOcrLanguage() {
  const { i18n } = useTranslation();
  const { classroomId } = useParams({ strict: false });
  const { data: user } = useCurrentUser();
  const isTutor = user?.default_layout === 'tutor';
  const classroomNumericId = Number(classroomId);
  const hasClassroom = Boolean(classroomId) && Number.isFinite(classroomNumericId);

  const tutorClassroom = useGetClassroom(classroomNumericId, !hasClassroom || isTutor !== true);
  const studentClassroom = useGetClassroomStudent(
    classroomNumericId,
    !hasClassroom || isTutor !== false,
  );

  const subjectName =
    tutorClassroom.data?.subject?.name ?? studentClassroom.data?.subject?.name ?? null;

  return useMemo(
    () => inferOcrLanguageFromSubject(subjectName) ?? inferOcrLanguageFromUiLocale(i18n.language),
    [subjectName, i18n.language],
  );
}

function useOcrLanguageAction(
  processingId: string,
  disabled: boolean | undefined,
  onRecognize: (language: OcrLanguage) => void,
) {
  const isProcessing = useOcrProcessingStore((state) => state.isProcessing(processingId));
  const languageChoice = useOcrPreferencesStore((state) => state.languageChoice);
  const lastResolvedLanguage = useOcrPreferencesStore((state) => state.lastResolvedLanguage);
  const setLanguageChoice = useOcrPreferencesStore((state) => state.setLanguageChoice);
  const rememberResolvedLanguage = useOcrPreferencesStore(
    (state) => state.rememberResolvedLanguage,
  );
  const contextualLanguage = useContextualOcrLanguage();

  const runOcr = useCallback(
    (choice: OcrLanguageChoice) => {
      if (disabled || isProcessing) return;

      setLanguageChoice(choice);
      const language = resolveOcrLanguage({
        selection: choice,
        lastResolvedLanguage,
        contextualLanguage,
      });
      rememberResolvedLanguage(language);
      onRecognize(language);
    },
    [
      contextualLanguage,
      disabled,
      isProcessing,
      lastResolvedLanguage,
      onRecognize,
      rememberResolvedLanguage,
      setLanguageChoice,
    ],
  );

  return { isProcessing, languageChoice, runOcr };
}

function useRecognizePrintedText(shapeId: DrShapeId, disabled?: boolean) {
  const editor = useEditor();
  const onRecognize = useCallback(
    (language: OcrLanguage) => {
      void recognizeBoardImageText(editor, shapeId, language);
    },
    [editor, shapeId],
  );

  return useOcrLanguageAction(shapeId, disabled, onRecognize);
}

export function RecognizePrintedTextSubmenu({
  shapeId,
  disabled,
}: {
  shapeId: DrShapeId;
  disabled?: boolean;
}) {
  const { t } = useTranslation('board');
  const { isProcessing, languageChoice, runOcr } = useRecognizePrintedText(shapeId, disabled);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={disabled || isProcessing}
        className={cn(boardMenuSubTriggerClass, 'rounded-lg px-3')}
      >
        {isProcessing ? t('ocr.processing') : t('ocr.recognize')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent
        sideOffset={12}
        alignOffset={-4}
        className={cn(boardMenuSurfaceClass, 'flex w-auto min-w-44 flex-col gap-1 rounded-xl p-1')}
      >
        {LANGUAGE_CHOICES.map((choice) => (
          <DropdownMenuItem
            key={choice}
            disabled={isProcessing}
            onClick={() => runOcr(choice)}
            className={cn(boardMenuItemClass, 'flex items-center rounded-lg px-3')}
            data-umami-event="board-ocr-recognize"
            data-umami-event-language={choice}
          >
            {t(`ocr.languages.${choice}`)}
            {languageChoice === choice ? (
              <span className="text-text-secondary ml-auto text-xs">{t('ocr.selected')}</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export function RecognizePrintedTextMobileRootRow({
  disabled,
  isProcessing,
  onOpen,
}: {
  disabled?: boolean;
  isProcessing: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslation('board');

  return (
    <button
      type="button"
      className={boardDrawerRowClass}
      disabled={disabled || isProcessing}
      onClick={onOpen}
    >
      <span className="text-text-primary min-w-0 flex-1 text-sm font-medium">
        {isProcessing ? t('ocr.processing') : t('ocr.recognize')}
      </span>
      <ArrowRight className="fill-icon-secondary size-4 shrink-0" />
    </button>
  );
}

export function RecognizePrintedTextMobileLanguageList({
  shapeId,
  disabled,
  onRun,
}: {
  shapeId: DrShapeId;
  disabled?: boolean;
  onRun?: () => void;
}) {
  const { t } = useTranslation('board');
  const { isProcessing, languageChoice, runOcr } = useRecognizePrintedText(shapeId, disabled);

  return (
    <div className="flex flex-col gap-3">
      {LANGUAGE_CHOICES.map((choice) => (
        <button
          key={choice}
          type="button"
          className={boardDrawerRowClass}
          disabled={isProcessing}
          onClick={() => {
            runOcr(choice);
            onRun?.();
          }}
        >
          <span className="text-text-primary min-w-0 flex-1 text-sm font-medium">
            {t(`ocr.languages.${choice}`)}
          </span>
          {languageChoice === choice ? (
            <span className="text-text-secondary text-xs">{t('ocr.selected')}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function RecognizePrintedTextControl({
  processingId,
  disabled,
  onRecognize,
  title,
}: {
  processingId: string;
  disabled?: boolean;
  onRecognize: (language: OcrLanguage) => void;
  title: string;
}) {
  const { t } = useTranslation('board');
  const { isProcessing, languageChoice, runOcr } = useOcrLanguageAction(
    processingId,
    disabled,
    onRecognize,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="none"
          size="s"
          className="hover:bg-status-info-background h-6 w-6 shrink-0 rounded-lg p-0 [&_svg]:size-3.5"
          disabled={disabled || isProcessing}
          title={isProcessing ? t('ocr.processing') : title}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {isProcessing ? (
            <Loader className={cn(boardIconClass, 'size-3.5 animate-spin')} />
          ) : (
            <TText className={cn(boardIconClass, 'size-3.5')} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="end"
        sideOffset={8}
        className={cn(
          boardMenuSurfaceClass,
          boardDropdownZClass,
          'flex w-auto min-w-44 flex-col gap-1 rounded-xl p-1',
        )}
      >
        {LANGUAGE_CHOICES.map((choice) => (
          <DropdownMenuItem
            key={choice}
            disabled={isProcessing}
            onClick={() => runOcr(choice)}
            className={cn(boardMenuItemClass, 'flex items-center rounded-lg px-3')}
            data-umami-event="board-ocr-recognize"
            data-umami-event-language={choice}
          >
            {t(`ocr.languages.${choice}`)}
            {languageChoice === choice ? (
              <span className="text-text-secondary ml-auto text-xs">{t('ocr.selected')}</span>
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
