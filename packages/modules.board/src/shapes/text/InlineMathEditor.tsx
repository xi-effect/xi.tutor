import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { MathfieldElement } from 'mathlive';
import { Button } from '@xipkg/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@xipkg/utils';
import {
  CASES_TEMPLATE,
  MATH_COMMANDS,
  MATH_TOOLBAR_GROUPS,
  MATRIX_TEMPLATES,
  searchMathCommands,
} from './mathCommands';
import {
  configureMathField,
  hideMathVirtualKeyboard,
  subscribeMathVirtualKeyboard,
  toggleMathVirtualKeyboard,
} from './mathFieldConfig';
import { trackMathEvent } from './mathTelemetry';

type InlineMathEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
};

const iconButtonClass =
  'text-text-primary hover:bg-gray-5 flex size-8 shrink-0 items-center justify-center rounded-md text-[15px] leading-none transition-colors';

function KeyboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <rect
        x="2.5"
        y="5"
        width="15"
        height="10"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 8h1.2M8 8h1.2M11 8h1.2M14 8h1.2M5 10.5h1.2M8 10.5h4M14 10.5h1.2M6.5 13h7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InlineMathEditor({ value, onChange, onApply, onCancel }: InlineMathEditorProps) {
  const { t } = useTranslation('board');
  const fieldRef = useRef<MathfieldElement | null>(null);
  const callbacksRef = useRef({ onChange, onApply, onCancel });
  const keyboardOpenRef = useRef(false);
  const [rawMode, setRawMode] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  callbacksRef.current = { onChange, onApply, onCancel };

  useEffect(() => {
    return subscribeMathVirtualKeyboard((visible) => {
      keyboardOpenRef.current = visible;
      setKeyboardOpen(visible);
    });
  }, []);

  useEffect(() => {
    if (rawMode) hideMathVirtualKeyboard();
  }, [rawMode]);

  useEffect(() => hideMathVirtualKeyboard, []);

  const groupedCommands = useMemo(
    () =>
      (Object.values(MATH_TOOLBAR_GROUPS) as readonly (readonly string[])[]).map((ids) =>
        ids
          .map((id) => MATH_COMMANDS.find((command) => command.id === id))
          .filter((command): command is (typeof MATH_COMMANDS)[number] => !!command),
      ),
    [],
  );
  const paletteCommands = useMemo(() => searchMathCommands(query).slice(0, 40), [query]);

  const closeOverlays = () => {
    setPaletteOpen(false);
    setMatrixOpen(false);
    setQuery('');
  };

  useLayoutEffect(() => {
    if (rawMode) return;
    const field = fieldRef.current;
    if (!field) return;
    field.value = value;
    configureMathField(field);
    field.setAttribute('placeholder', t('math.placeholder'));

    const handleInput = () => callbacksRef.current.onChange(field.value);
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        if (keyboardOpenRef.current) {
          hideMathVirtualKeyboard();
          return;
        }
        callbacksRef.current.onCancel();
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        callbacksRef.current.onApply();
      }
    };
    field.addEventListener('input', handleInput);
    field.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => field.focus(), 0);
    return () => {
      window.clearTimeout(focusTimer);
      field.removeEventListener('input', handleInput);
      field.removeEventListener('keydown', handleKeyDown);
    };
    // A fresh field is mounted when rawMode changes; live input owns subsequent value updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMode, t]);

  const insert = (latex: string, action: string) => {
    const field = fieldRef.current;
    if (!field) return;
    field.insert(latex, {
      insertionMode: 'replaceSelection',
      selectionMode: 'placeholder',
      focus: true,
    });
    onChange(field.value);
    trackMathEvent('math_toolbar_used', action);
    closeOverlays();
  };

  const keepFocus = (event: React.PointerEvent<HTMLButtonElement>) => event.preventDefault();

  return (
    <div
      data-math-editor
      className="flex w-full flex-col gap-3"
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key !== 'Escape') return;
        if (paletteOpen || matrixOpen) {
          event.preventDefault();
          closeOverlays();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-text-primary text-sm font-medium">{t('math.title')}</p>
        <p className="text-text-secondary pt-0.5 text-right text-xs">{t('math.hint')}</p>
      </div>

      {rawMode ? (
        <textarea
          data-math-editor
          autoFocus
          spellCheck={false}
          value={value}
          rows={3}
          aria-label={t('math.rawLatex')}
          placeholder={t('math.placeholder')}
          className="border-gray-10 bg-gray-5 text-text-primary min-h-24 w-full resize-y rounded-xl border px-3 py-3 font-mono text-sm outline-none"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onCancel();
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') onApply();
          }}
        />
      ) : (
        <div className="border-gray-10 bg-gray-5 focus-within:border-brand-80 min-h-24 overflow-x-auto rounded-xl border px-3 py-2">
          {createElement('math-field', {
            ref: (node: HTMLElement | null) => {
              fieldRef.current = node as MathfieldElement | null;
            },
            class: 'inline-math-field',
            'aria-label': t('math.title'),
          })}
        </div>
      )}

      {!rawMode &&
        (paletteOpen ? (
          <div className="border-gray-10 bg-gray-5 flex max-h-56 flex-col rounded-xl border">
            <div className="flex items-center gap-2 p-2">
              <input
                data-math-editor
                autoFocus
                value={query}
                placeholder={t('math.searchPlaceholder')}
                className="border-gray-10 bg-background-surface text-text-primary min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-sm outline-none"
                onChange={(event) => setQuery(event.target.value)}
              />
              <Button type="button" variant="ghost" size="s" onClick={closeOverlays}>
                {t('math.closePalette')}
              </Button>
            </div>
            <div className="min-h-0 overflow-y-auto px-1 pb-1">
              {paletteCommands.map((command) => (
                <button
                  key={command.id}
                  type="button"
                  className="hover:bg-background-surface text-text-primary flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm"
                  onClick={() => insert(command.latex, command.id)}
                >
                  <span>{command.aliases[0]}</span>
                  <span className="text-text-secondary font-mono text-[13px]">{command.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {groupedCommands.map((group, index) => (
              <div
                key={group[0]?.id ?? index}
                className={
                  index === groupedCommands.length - 1
                    ? 'grid grid-cols-4 gap-0.5'
                    : 'grid grid-cols-8 gap-0.5'
                }
              >
                {group.map((command) => (
                  <button
                    key={command.id}
                    type="button"
                    className={iconButtonClass}
                    title={command.aliases[0]}
                    aria-label={command.aliases[0]}
                    onPointerDown={keepFocus}
                    onClick={() => insert(command.latex, command.id)}
                  >
                    {command.label}
                  </button>
                ))}
              </div>
            ))}
            <div className="mt-0.5 grid grid-cols-3 gap-1">
              <button
                type="button"
                className={cn(iconButtonClass, 'h-8 w-full text-sm', matrixOpen && 'bg-gray-10')}
                onPointerDown={keepFocus}
                onClick={() => setMatrixOpen((open) => !open)}
              >
                {t('math.matrix')}
              </button>
              <button
                type="button"
                className={cn(iconButtonClass, 'h-8 w-full text-sm')}
                onPointerDown={keepFocus}
                onClick={() => insert(CASES_TEMPLATE, 'cases')}
              >
                {t('math.system')}
              </button>
              <button
                type="button"
                className={cn(iconButtonClass, 'h-8 w-full text-sm')}
                title={t('math.commandPalette')}
                onPointerDown={keepFocus}
                onClick={() => {
                  setMatrixOpen(false);
                  setPaletteOpen(true);
                }}
              >
                {t('math.more')}
              </button>
            </div>
            {matrixOpen && (
              <div className="grid grid-cols-4 gap-1 pt-0.5">
                {Object.entries(MATRIX_TEMPLATES).map(([size, latex]) => (
                  <button
                    key={size}
                    type="button"
                    className={cn(iconButtonClass, 'h-8 w-full text-sm')}
                    onPointerDown={keepFocus}
                    onClick={() => insert(latex, `matrix_${size}`)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

      <div className="border-gray-10 flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="s"
            data-isactive={rawMode}
            className={cn(rawMode && 'bg-gray-10')}
            onClick={() => {
              closeOverlays();
              setRawMode((open) => !open);
              trackMathEvent('math_latex_mode_opened');
            }}
          >
            LaTeX
          </Button>
          {!rawMode && (
            <Button
              type="button"
              variant="ghost"
              size="s"
              title={keyboardOpen ? t('math.hideKeyboard') : t('math.virtualKeyboard')}
              data-isactive={keyboardOpen}
              className={cn(keyboardOpen && 'bg-gray-10')}
              onPointerDown={keepFocus}
              onClick={() => {
                const opened = toggleMathVirtualKeyboard();
                if (opened) {
                  fieldRef.current?.focus();
                  trackMathEvent('math_virtual_keyboard_opened');
                }
              }}
            >
              <KeyboardIcon className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="s" onClick={onCancel}>
            {t('math.cancel')}
          </Button>
          <Button type="button" size="s" disabled={!value.trim()} onClick={onApply}>
            {t('math.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
}
