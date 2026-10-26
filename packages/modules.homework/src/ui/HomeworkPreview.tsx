import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { promptPlainText } from '../model';
import type { HomeworkDraft } from '../types';
import { RichText } from './RichText';
import './promptEditor.css';

type HomeworkPreviewProps = {
  draft: HomeworkDraft;
};

type PreviewValue = string | string[];

export const HomeworkPreview = ({ draft }: HomeworkPreviewProps) => {
  const { t } = useTranslation('homeworkEditor');
  const [answers, setAnswers] = useState<Record<string, PreviewValue>>({});

  const setAnswer = (id: string, value: PreviewValue) => {
    setAnswers((current) => ({ ...current, [id]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="bg-status-info-background text-text-primary rounded-2xl px-4 py-3 text-sm">
        {t('preview.banner')}
      </p>

      <section className="flex flex-col gap-2">
        {draft.description ? (
          <p className="text-text-secondary text-sm whitespace-pre-wrap">{draft.description}</p>
        ) : null}
        {draft.content.estimatedMinutes ? (
          <p className="text-text-secondary text-xs">
            {t('preview.minutes', { count: draft.content.estimatedMinutes })}
          </p>
        ) : null}
      </section>

      {draft.content.questions.length === 0 ? (
        <p className="text-text-secondary px-4 py-6 text-center text-sm">{t('emptyQuestions')}</p>
      ) : (
        draft.content.questions.map((question, index) => {
          const value = answers[question.id];
          const prompt = promptPlainText(question.promptHtml);
          return (
            <section key={question.id} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <span className="text-text-secondary text-sm">{index + 1}.</span>
                <div className="min-w-0 flex-1">
                  {prompt ? (
                    <RichText html={question.promptHtml} />
                  ) : (
                    <p className="text-text-secondary text-sm">{t('emptyPrompt')}</p>
                  )}
                  {question.required ? (
                    <p className="text-text-secondary mt-1 text-xs">{t('required')}</p>
                  ) : null}
                </div>
              </div>

              {question.type === 'short_text' ? (
                <input
                  className="border-border-default bg-background-page text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
                  placeholder={t('preview.shortPlaceholder')}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                />
              ) : null}

              {question.type === 'long_text' ? (
                <textarea
                  className="border-border-default bg-background-page text-text-primary min-h-28 rounded-xl border px-3 py-2 text-sm outline-none"
                  placeholder={t('preview.longPlaceholder')}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                />
              ) : null}

              {question.type === 'number' ? (
                <input
                  type="number"
                  className="border-border-default bg-background-page text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
                  placeholder={t('preview.numberPlaceholder')}
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                />
              ) : null}

              {question.type === 'dropdown' ? (
                <select
                  className="border-border-default bg-background-page text-text-primary rounded-xl border px-3 py-2 text-sm outline-none"
                  value={typeof value === 'string' ? value : ''}
                  onChange={(event) => setAnswer(question.id, event.target.value)}
                >
                  <option value="">{t('preview.dropdownPlaceholder')}</option>
                  {question.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.text || t('optionPlaceholder')}
                    </option>
                  ))}
                </select>
              ) : null}

              {question.type === 'single_choice' || question.type === 'multiple_choice'
                ? question.options.map((option) => {
                    const selected =
                      question.type === 'multiple_choice'
                        ? Array.isArray(value) && value.includes(option.id)
                        : value === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={selected}
                        className={`rounded-xl border px-3 py-2 text-left text-sm ${
                          selected
                            ? 'border-text-link bg-status-info-background text-text-primary'
                            : 'border-border-default bg-background-page text-text-primary'
                        }`}
                        onClick={() => {
                          if (question.type === 'single_choice') {
                            setAnswer(question.id, option.id);
                            return;
                          }
                          const current = Array.isArray(value) ? value : [];
                          setAnswer(
                            question.id,
                            current.includes(option.id)
                              ? current.filter((id) => id !== option.id)
                              : [...current, option.id],
                          );
                        }}
                      >
                        {option.text || t('optionPlaceholder')}
                      </button>
                    );
                  })
                : null}

              {question.type === 'file' ? (
                <label className="text-text-primary text-sm">
                  <span className="border-border-default bg-background-page inline-flex cursor-pointer rounded-xl border px-3 py-2">
                    {t('preview.file')}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(event) =>
                      setAnswer(question.id, event.target.files?.[0]?.name ?? '')
                    }
                  />
                  {typeof value === 'string' && value ? (
                    <span className="text-text-secondary mt-2 block text-xs">
                      {t('preview.fileChosen', { name: value })}
                    </span>
                  ) : null}
                </label>
              ) : null}
            </section>
          );
        })
      )}
    </div>
  );
};
