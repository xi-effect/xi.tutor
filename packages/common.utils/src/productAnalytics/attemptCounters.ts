const SIGNUP_ATTEMPT_KEY = 'activation_signup_attempt_number';
const EMAIL_RESEND_ATTEMPT_KEY = 'activation_email_resend_attempt_number';

function readCounter(key: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(key);
    const value = raw ? Number(raw) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function writeCounter(key: string, value: number): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

/** Номер попытки API-регистрации в рамках вкладки (1, 2, 3…). */
export function nextSignupAttemptNumber(): number {
  const next = readCounter(SIGNUP_ATTEMPT_KEY) + 1;
  writeCounter(SIGNUP_ATTEMPT_KEY, next);
  return next;
}

/** Номер попытки resend письма в рамках вкладки. */
export function nextEmailResendAttemptNumber(): number {
  const next = readCounter(EMAIL_RESEND_ATTEMPT_KEY) + 1;
  writeCounter(EMAIL_RESEND_ATTEMPT_KEY, next);
  return next;
}
