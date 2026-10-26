import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  createQuestion,
  duplicateQuestion,
  normalizeHomeworkDraft,
  serializeHomeworkDraft,
} from '../model';
import type { HomeworkDraft, HomeworkQuestion, HomeworkQuestionType } from '../types';
import { AssignmentSettings } from './AssignmentFields';
import { EditorHeader, type EditorMode } from './EditorHeader';
import { HomeworkPreview } from './HomeworkPreview';
import { QuestionList } from './QuestionList';
import 'katex/dist/katex.min.css';

export type HomeworkEditorSaveMeta = {
  questionsChanged: boolean;
};

type HomeworkEditorProps = {
  initial: HomeworkDraft;
  fallbackTitle: string;
  onSave: (draft: HomeworkDraft, meta: HomeworkEditorSaveMeta) => void;
  onBack: () => void;
};

export const HomeworkEditor = ({ initial, fallbackTitle, onSave, onBack }: HomeworkEditorProps) => {
  const { t } = useTranslation('homeworkEditor');
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(() => serializeHomeworkDraft(initial));
  const [mode, setMode] = useState<EditorMode>('edit');
  const [activeId, setActiveId] = useState<string | null>(initial.content.questions[0]?.id ?? null);
  const initialQuestions = useRef(JSON.stringify(initial.content.questions));
  const draftRef = useRef(draft);
  const savedRef = useRef(saved);
  const onSaveRef = useRef(onSave);
  const questionsChangedRef = useRef(false);

  draftRef.current = draft;
  savedRef.current = saved;
  onSaveRef.current = onSave;
  questionsChangedRef.current =
    JSON.stringify(draft.content.questions) !== initialQuestions.current;

  const serialized = serializeHomeworkDraft(draft);
  const dirty = serialized !== saved;

  const persist = useCallback(() => {
    const next = draftRef.current;
    const snapshot = serializeHomeworkDraft(next);
    if (snapshot === savedRef.current) return;
    const title = next.title.trim() || fallbackTitle;
    onSaveRef.current(normalizeHomeworkDraft({ ...next, title }), {
      questionsChanged: questionsChangedRef.current,
    });
    savedRef.current = snapshot;
    setSaved(snapshot);
    if (!next.title.trim()) {
      setDraft((current) => ({ ...current, title }));
    }
  }, [fallbackTitle]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(persist, 800);
    return () => window.clearTimeout(timer);
  }, [dirty, serialized, persist]);

  useEffect(() => {
    const onLeave = () => persist();
    window.addEventListener('beforeunload', onLeave);
    window.addEventListener('pagehide', onLeave);
    return () => {
      window.removeEventListener('beforeunload', onLeave);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [persist]);

  const updateQuestion = (question: HomeworkQuestion) => {
    setDraft((current) => ({
      ...current,
      content: {
        ...current.content,
        questions: current.content.questions.map((item) =>
          item.id === question.id ? question : item,
        ),
      },
    }));
  };

  const addQuestion = (type: HomeworkQuestionType) => {
    const question = createQuestion(type);
    setDraft((current) => ({
      ...current,
      content: { ...current.content, questions: [...current.content.questions, question] },
    }));
    setActiveId(question.id);
  };

  const duplicate = (id: string) => {
    const source = draft.content.questions.find((question) => question.id === id);
    if (!source) return;
    const copy = duplicateQuestion(source);
    setDraft((current) => {
      const index = current.content.questions.findIndex((question) => question.id === id);
      if (index < 0) return current;
      const questions = current.content.questions.slice();
      questions.splice(index + 1, 0, copy);
      return { ...current, content: { ...current.content, questions } };
    });
    setActiveId(copy.id);
  };

  const removeQuestion = (id: string) => {
    const index = draft.content.questions.findIndex((question) => question.id === id);
    const removed = draft.content.questions[index];
    if (!removed) return;
    setDraft((current) => ({
      ...current,
      content: {
        ...current.content,
        questions: current.content.questions.filter((question) => question.id !== id),
      },
    }));
    if (activeId === id) setActiveId(null);
    toast(t('deleted'), {
      action: {
        label: t('undo'),
        onClick: () => {
          setDraft((current) => {
            const questions = current.content.questions.slice();
            questions.splice(Math.min(index, questions.length), 0, removed);
            return { ...current, content: { ...current.content, questions } };
          });
          setActiveId(removed.id);
        },
      },
    });
  };

  return (
    <div className="bg-background-page flex h-full min-h-0 flex-col overflow-hidden">
      <EditorHeader
        title={draft.title}
        mode={mode}
        onTitle={(title) => setDraft((current) => ({ ...current, title }))}
        onBack={() => {
          persist();
          onBack();
        }}
        onMode={setMode}
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {mode === 'settings' ? (
          <div className="mx-auto flex w-full max-w-xl flex-col px-4 py-6 sm:px-6">
            <AssignmentSettings
              description={draft.description}
              content={draft.content}
              onDescription={(description) => setDraft((current) => ({ ...current, description }))}
              onContent={(patch) =>
                setDraft((current) => ({
                  ...current,
                  content: { ...current.content, ...patch },
                }))
              }
            />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
            {mode === 'preview' ? (
              <HomeworkPreview draft={draft} />
            ) : (
              <QuestionList
                questions={draft.content.questions}
                activeId={activeId}
                onSelect={setActiveId}
                onChange={updateQuestion}
                onAdd={addQuestion}
                onDuplicate={duplicate}
                onDelete={removeQuestion}
                onReorder={(fromId, toId) => {
                  setDraft((current) => {
                    const questions = current.content.questions;
                    const from = questions.findIndex((question) => question.id === fromId);
                    const to = questions.findIndex((question) => question.id === toId);
                    if (from < 0 || to < 0) return current;
                    return {
                      ...current,
                      content: { ...current.content, questions: arrayMove(questions, from, to) },
                    };
                  });
                }}
                onReorderOption={(questionId, fromId, toId) => {
                  setDraft((current) => ({
                    ...current,
                    content: {
                      ...current.content,
                      questions: current.content.questions.map((question) => {
                        if (question.id !== questionId) return question;
                        const from = question.options.findIndex((option) => option.id === fromId);
                        const to = question.options.findIndex((option) => option.id === toId);
                        if (from < 0 || to < 0) return question;
                        return { ...question, options: arrayMove(question.options, from, to) };
                      }),
                    },
                  }));
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
