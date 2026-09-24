import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { TiptapEditor } from '@ibodr/draw';
import '@tiptap/extension-mathematics';
import { NavbarButton } from '../../ui/components/shared';
import { Formula, Fraction, Subscript, Superscript } from '../../ui/icons/mathIcons';
import {
  getInlineMathNearSelection,
  getSelectedPlainText,
  latexFromSelectedText,
} from './utils/mathLatex';
import { subscribeInlineMathEdit } from './utils/inlineMathEdit';
import { InlineMathEditor } from './InlineMathEditor';
import { hideMathVirtualKeyboard } from './mathFieldConfig';
import { trackMathEvent } from './mathTelemetry';

type MathFormatToolbarProps = {
  textEditor: TiptapEditor | null;
  isSuperscript: boolean;
  isSubscript: boolean;
  onToggleSuperscript: () => void;
  onToggleSubscript: () => void;
};

function insertInlineMath(textEditor: TiptapEditor, latex: string) {
  const trimmed = latex.trim();
  if (!trimmed) return;
  if (textEditor.state.selection.from !== textEditor.state.selection.to) {
    textEditor.chain().focus().deleteSelection().run();
  }
  textEditor.commands.insertInlineMath({ latex: trimmed });
}

export function MathFormatToolbar({
  textEditor,
  isSuperscript,
  isSubscript,
  onToggleSuperscript,
  onToggleSubscript,
}: MathFormatToolbarProps) {
  const { t } = useTranslation('board');
  const [latexOpen, setLatexOpen] = useState(false);
  const [latexDraft, setLatexDraft] = useState('');
  const [editPos, setEditPos] = useState<number | null>(null);

  useEffect(() => {
    return subscribeInlineMathEdit((request) => {
      setLatexDraft(request.latex);
      setEditPos(request.pos);
      setLatexOpen(true);
    });
  }, []);

  const openLatexEditor = () => {
    if (!textEditor) return;
    const nearby = getInlineMathNearSelection(textEditor);
    const selected = getSelectedPlainText(textEditor);
    setLatexDraft(nearby?.latex ?? latexFromSelectedText(selected, 'wrap'));
    setEditPos(nearby?.pos ?? null);
    setLatexOpen(true);
  };

  const insertFraction = () => {
    if (!textEditor) return;
    const selected = getSelectedPlainText(textEditor);
    insertInlineMath(textEditor, latexFromSelectedText(selected, 'fraction'));
    trackMathEvent('math_element_created', 'fraction');
  };

  const submitLatex = () => {
    if (!textEditor) return;
    const latex = latexDraft.trim();
    if (!latex) return;
    const nearby = getInlineMathNearSelection(textEditor);
    const pos = nearby?.pos ?? editPos;
    if (pos != null && textEditor.state.doc.nodeAt(pos)?.type.name === 'inlineMath') {
      textEditor.commands.updateInlineMath({ pos, latex });
      trackMathEvent('math_element_edited');
    } else {
      insertInlineMath(textEditor, latex);
      trackMathEvent('math_element_created');
    }
    setLatexDraft('');
    setLatexOpen(false);
    setEditPos(null);
    hideMathVirtualKeyboard();
  };

  const cancelLatex = () => {
    hideMathVirtualKeyboard();
    setLatexDraft('');
    setLatexOpen(false);
    setEditPos(null);
    textEditor?.commands.focus();
  };

  return (
    <>
      <NavbarButton
        icon={<Formula />}
        title={t('textFormat.math')}
        isActive={latexOpen}
        disabled={!textEditor}
        onClick={openLatexEditor}
      />
      {!latexOpen && (
        <>
          <NavbarButton
            icon={<Superscript />}
            title={t('textFormat.superscript')}
            isActive={isSuperscript}
            onClick={onToggleSuperscript}
          />
          <NavbarButton
            icon={<Subscript />}
            title={t('textFormat.subscript')}
            isActive={isSubscript}
            onClick={onToggleSubscript}
          />
          <NavbarButton
            icon={<Fraction />}
            title={t('textFormat.fraction')}
            isActive={false}
            disabled={!textEditor}
            onClick={insertFraction}
          />
        </>
      )}
      {latexOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-0 z-2000 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label={t('math.cancel')}
              className="pointer-events-auto absolute inset-0 bg-black/30"
              onClick={cancelLatex}
            />
            <div
              data-math-editor
              role="dialog"
              aria-modal="true"
              aria-label={t('math.title')}
              className="border-border-default bg-background-surface pointer-events-auto relative w-full max-w-md rounded-2xl border p-4 shadow-xl"
              style={{ marginBottom: 'var(--math-vk-height, 0px)' }}
              onPointerDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
            >
              <InlineMathEditor
                value={latexDraft}
                onChange={setLatexDraft}
                onApply={submitLatex}
                onCancel={cancelLatex}
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
