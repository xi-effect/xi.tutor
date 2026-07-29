import type {
  CallFailureReason,
  EmailConfirmationFailureReason,
  InviteFailureReason,
  LessonCreateFailureReason,
  PermissionFailureReason,
  SignupFailureReason,
  SignupValidationFailureReason,
  HttpStatusGroup,
} from './types';

type ErrorLike = {
  message?: string;
  code?: string | number;
  name?: string;
  response?: {
    status?: number;
    data?: {
      detail?: string | { msg?: string; type?: string } | Array<{ msg?: string; type?: string }>;
    };
  };
};

function asErrorLike(error: unknown): ErrorLike {
  if (!error || typeof error !== 'object') return {};
  return error as ErrorLike;
}

export function getHttpStatusGroup(error: unknown): HttpStatusGroup {
  const status = asErrorLike(error).response?.status;
  if (!status) return 'none';
  if (status >= 500) return '5xx';
  if (status >= 400) return '4xx';
  return 'none';
}

function getDetailString(error: unknown): string {
  const detail = asErrorLike(error).response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  if (detail && typeof detail === 'object' && 'msg' in detail && detail.msg) {
    return String(detail.msg);
  }
  return '';
}

export function mapSignupError(error: unknown): SignupFailureReason {
  const err = asErrorLike(error);
  const status = err.response?.status;
  const detail = getDetailString(error).toLowerCase();

  if (detail.includes('username already')) {
    return 'username_exists';
  }

  if (
    detail.includes('email already') ||
    (detail.includes('email') && detail.includes('already'))
  ) {
    return 'email_exists';
  }

  // Fallback для старых формулировок backend
  if (detail.includes('already in use')) {
    return detail.includes('username') ? 'username_exists' : 'email_exists';
  }

  if (status === 429) return 'rate_limited';
  if (status && status >= 500) return 'server_error';

  if (err.code === 'ECONNABORTED' || detail.includes('timeout')) return 'timeout';
  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') return 'network_error';

  if (status && status >= 400) return 'unknown';
  if (!status) return 'network_error';

  return 'unknown';
}

type FieldErrorLike = {
  type?: string;
  message?: string;
};

function asFieldError(value: unknown): FieldErrorLike | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as FieldErrorLike;
}

export function mapSignupValidationErrors(fieldErrors: Partial<Record<string, unknown>>): {
  reason: SignupValidationFailureReason;
  field: 'name' | 'email' | 'password' | 'terms' | 'multiple';
} {
  const invalidFields = Object.keys(fieldErrors).filter((key) => fieldErrors[key] != null);

  if (invalidFields.length > 1) {
    return { reason: 'multiple_fields', field: 'multiple' };
  }

  const field = invalidFields[0];
  const fieldError = asFieldError(fieldErrors[field]);
  const errorType = fieldError?.type ?? '';

  if (field === 'username') {
    return { reason: 'required_field', field: 'name' };
  }

  if (field === 'email') {
    if (errorType === 'too_small' || errorType === 'invalid_type' || errorType === 'required') {
      return { reason: 'required_field', field: 'email' };
    }
    return { reason: 'invalid_email', field: 'email' };
  }

  if (field === 'password') {
    if (errorType === 'invalid_type' || errorType === 'required') {
      return { reason: 'required_field', field: 'password' };
    }
    // too_small при min(6) = слабый пароль; пустая строка тоже too_small у zod string().min()
    if (errorType === 'too_small') {
      return { reason: 'weak_password', field: 'password' };
    }
    return { reason: 'weak_password', field: 'password' };
  }

  if (field === 'consent') {
    return { reason: 'terms_not_accepted', field: 'terms' };
  }

  return { reason: 'required_field', field: 'multiple' };
}

export function mapEmailConfirmationError(error: unknown): EmailConfirmationFailureReason {
  const status = asErrorLike(error).response?.status;
  const detail = getDetailString(error).toLowerCase();

  if (status === 409 || detail.includes('already')) return 'already_confirmed';
  if (status === 410 || detail.includes('expired')) return 'expired';
  if (status === 400 || status === 404 || detail.includes('invalid')) return 'invalid_token';
  if (status && status >= 500) return 'server_error';
  if (!status) return 'network_error';
  return 'unknown';
}

export function mapInviteError(error: unknown): InviteFailureReason {
  const status = asErrorLike(error).response?.status;
  const detail = getDetailString(error).toLowerCase();

  if (status === 429 || detail.includes('limit')) return 'limit_reached';
  if (status === 400 || status === 422) return 'invalid_data';
  if (status && status >= 500) return 'server_error';
  if (!status) return 'network_error';
  return 'unknown';
}

export function mapLessonCreateError(error: unknown): LessonCreateFailureReason {
  const status = asErrorLike(error).response?.status;
  const detail = getDetailString(error).toLowerCase();

  if (detail.includes('student') || detail.includes('classroom')) return 'no_students';
  if (detail.includes('conflict') || detail.includes('overlap')) return 'schedule_conflict';
  if (detail.includes('time') || detail.includes('starts_at')) return 'invalid_time';
  if (status === 400 || status === 422) return 'validation_error';
  if (status && status >= 500) return 'server_error';
  if (!status) return 'network_error';
  return 'unknown';
}

export function mapCallError(error: unknown): CallFailureReason {
  const err = asErrorLike(error);
  const status = err.response?.status;
  const message = (err.message ?? '').toLowerCase();
  const detail = getDetailString(error).toLowerCase();
  const combined = `${message} ${detail}`;

  if (status === 401 || status === 403 || combined.includes('token')) return 'token_error';
  if (combined.includes('permission') || combined.includes('notallowed')) return 'permission_error';
  if (combined.includes('ice') || combined.includes('candidate')) return 'ice_failed';
  if (combined.includes('timeout') || err.code === 'ECONNABORTED') return 'timeout';
  if (combined.includes('unsupported') || combined.includes('browser'))
    return 'unsupported_browser';
  if (status && status >= 500) return 'server_unavailable';
  if (!status || err.code === 'ERR_NETWORK') return 'network_error';
  return 'unknown';
}

export function mapPermissionError(error: unknown): PermissionFailureReason {
  const message = (asErrorLike(error).message ?? '').toLowerCase();
  const name = (asErrorLike(error).name ?? '').toLowerCase();

  if (name.includes('notallowed') || message.includes('denied') || message.includes('notallowed')) {
    return 'user_denied';
  }
  if (message.includes('blocked') || message.includes('permission denied by system')) {
    return 'browser_blocked';
  }
  if (message.includes('notfound') || message.includes('device not found')) {
    return 'device_missing';
  }
  if (
    message.includes('notreadable') ||
    message.includes('trackstart') ||
    message.includes('busy')
  ) {
    return 'device_busy';
  }
  if (message.includes('notsupported') || message.includes('unsupported')) {
    return 'unsupported';
  }
  return 'unknown';
}
