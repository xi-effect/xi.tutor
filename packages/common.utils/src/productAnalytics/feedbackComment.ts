export const FEEDBACK_COMMENT_MAX_LENGTH = 500;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?<!\d)(?:\+?\d[\d\s\-()]{8,}\d)(?!\d)/g;

export function maskFeedbackPii(text: string): string {
  return text.replace(EMAIL_RE, '[email]').replace(PHONE_RE, '[phone]');
}

/**
 * Готовит необязательный комментарий к feedback: trim, маскирование email/телефона,
 * обрезка до 500 символов. Пустую строку не возвращает.
 */
export function prepareFeedbackComment(raw: string | null | undefined): string | undefined {
  if (typeof raw !== 'string') return undefined;

  let text = raw.trim();
  if (!text) return undefined;

  text = maskFeedbackPii(text).trim();
  if (!text) return undefined;

  if (text.length > FEEDBACK_COMMENT_MAX_LENGTH) {
    text = text.slice(0, FEEDBACK_COMMENT_MAX_LENGTH);
  }

  return text;
}
