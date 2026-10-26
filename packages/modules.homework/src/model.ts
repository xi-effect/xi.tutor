import {
  HOMEWORK_DESCRIPTION_MAX,
  HOMEWORK_TITLE_MAX,
  isChoiceQuestionType,
  isHomeworkQuestionType,
  type HomeworkContent,
  type HomeworkDraft,
  type HomeworkOption,
  type HomeworkQuestion,
  type HomeworkQuestionType,
} from './types';

const createId = () => crypto.randomUUID();

export const createOption = (text = ''): HomeworkOption => ({
  id: createId(),
  text,
  isCorrect: false,
});

export const emptyHomeworkContent = (): HomeworkContent => ({
  estimatedMinutes: null,
  allowRetake: false,
  showCorrectAnswers: false,
  questions: [],
});

export const createQuestion = (type: HomeworkQuestionType): HomeworkQuestion => ({
  id: createId(),
  type,
  promptHtml: '',
  required: false,
  options: isChoiceQuestionType(type) ? [createOption(), createOption()] : [],
  correctAnswer: '',
});

export const duplicateQuestion = (question: HomeworkQuestion): HomeworkQuestion => ({
  ...question,
  id: createId(),
  options: question.options.map((option) => ({ ...option, id: createId() })),
});

export const cloneHomeworkContent = (content: HomeworkContent): HomeworkContent => ({
  ...content,
  questions: content.questions.map(duplicateQuestion),
});

const keepSingleCorrectOption = (options: HomeworkOption[]) => {
  let kept = false;
  return options.map((option) => {
    if (!option.isCorrect) return option;
    if (kept) return { ...option, isCorrect: false };
    kept = true;
    return option;
  });
};

export const withQuestionType = (
  question: HomeworkQuestion,
  type: HomeworkQuestionType,
): HomeworkQuestion => {
  if (!isChoiceQuestionType(type)) {
    return { ...question, type };
  }

  const filled =
    question.options.length >= 2
      ? question.options
      : [
          ...question.options,
          ...Array.from({ length: 2 - question.options.length }, () => createOption()),
        ];
  const options =
    type === 'single_choice' || type === 'dropdown' ? keepSingleCorrectOption(filled) : filled;

  return { ...question, type, options };
};

export const toggleOptionCorrect = (
  question: HomeworkQuestion,
  optionId: string,
): HomeworkQuestion => {
  const exclusive = question.type === 'single_choice' || question.type === 'dropdown';
  return {
    ...question,
    options: question.options.map((option) => {
      if (option.id === optionId) {
        return { ...option, isCorrect: !option.isCorrect };
      }
      if (exclusive) return { ...option, isCorrect: false };
      return option;
    }),
  };
};

const fallbackPlainText = (html: string) =>
  html
    .replace(/<span\b[^>]*\bdata-latex="([^"]*)"[^>]*>[\s\S]*?<\/span>/gi, ' $1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

export const promptPlainText = (html: string) => {
  if (typeof DOMParser === 'undefined') return fallbackPlainText(html);

  const document = new DOMParser().parseFromString(html, 'text/html');
  document.querySelectorAll('[data-latex]').forEach((element) => {
    element.replaceWith(` ${element.getAttribute('data-latex') ?? ''} `);
  });
  const text = (document.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (text) return text;
  return document.querySelector('img') ? '\u200b' : '';
};

const normalizeOption = (value: unknown): HomeworkOption | null => {
  if (!value || typeof value !== 'object') return null;
  const option = value as Record<string, unknown>;
  if (typeof option.id !== 'string' || option.id.length === 0) return null;
  return {
    id: option.id,
    text: typeof option.text === 'string' ? option.text : '',
    isCorrect: option.isCorrect === true,
  };
};

const normalizeQuestion = (value: unknown): HomeworkQuestion | null => {
  if (!value || typeof value !== 'object') return null;
  const question = value as Record<string, unknown>;
  if (typeof question.id !== 'string' || question.id.length === 0) return null;
  if (typeof question.type !== 'string' || !isHomeworkQuestionType(question.type)) return null;

  const options = Array.isArray(question.options)
    ? question.options.flatMap((option) => {
        const normalized = normalizeOption(option);
        return normalized ? [normalized] : [];
      })
    : [];

  return withQuestionType(
    {
      id: question.id,
      type: question.type,
      promptHtml: typeof question.promptHtml === 'string' ? question.promptHtml : '',
      required: question.required === true,
      options,
      correctAnswer: typeof question.correctAnswer === 'string' ? question.correctAnswer : '',
    },
    question.type,
  );
};

export const normalizeHomeworkContent = (value: unknown): HomeworkContent => {
  if (!value || typeof value !== 'object') return emptyHomeworkContent();
  const content = value as Record<string, unknown>;
  const minutes = content.estimatedMinutes;
  const questions = Array.isArray(content.questions)
    ? content.questions.flatMap((question) => {
        const normalized = normalizeQuestion(question);
        return normalized ? [normalized] : [];
      })
    : [];

  return {
    estimatedMinutes:
      typeof minutes === 'number' && Number.isFinite(minutes) && minutes > 0
        ? Math.min(600, Math.round(minutes))
        : null,
    allowRetake: content.allowRetake === true,
    showCorrectAnswers: content.showCorrectAnswers === true,
    questions,
  };
};

export const normalizeHomeworkDraft = (draft: HomeworkDraft): HomeworkDraft => ({
  title: draft.title.trim().slice(0, HOMEWORK_TITLE_MAX),
  description: draft.description.trim().slice(0, HOMEWORK_DESCRIPTION_MAX),
  content: draft.content,
});

export const serializeHomeworkDraft = (draft: HomeworkDraft) => JSON.stringify(draft);
