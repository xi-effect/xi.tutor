import { describe, expect, it } from 'vitest';
import {
  getHttpStatusGroup,
  mapCallError,
  mapEmailConfirmationError,
  mapInviteError,
  mapLessonCreateError,
  mapPermissionError,
  mapSignupError,
  mapSignupValidationErrors,
} from '../errorMappers';

const httpError = (status: number, detail?: unknown, extras: Record<string, unknown> = {}) => ({
  response: { status, data: detail !== undefined ? { detail } : undefined },
  ...extras,
});

describe('getHttpStatusGroup', () => {
  it('группирует статусы', () => {
    expect(getHttpStatusGroup({})).toBe('none');
    expect(getHttpStatusGroup(httpError(404))).toBe('4xx');
    expect(getHttpStatusGroup(httpError(503))).toBe('5xx');
  });
});

describe('mapSignupError', () => {
  it('мапит username/email already', () => {
    expect(mapSignupError(httpError(400, 'Username already registered'))).toBe('username_exists');
    expect(mapSignupError(httpError(400, 'Email already registered'))).toBe('email_exists');
    expect(mapSignupError(httpError(400, 'Email is already in use'))).toBe('email_exists');
  });

  it('мапит rate limit, server и network', () => {
    expect(mapSignupError(httpError(429))).toBe('rate_limited');
    expect(mapSignupError(httpError(500))).toBe('server_error');
    expect(mapSignupError({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe('network_error');
    expect(mapSignupError({ code: 'ECONNABORTED' })).toBe('timeout');
  });
});

describe('mapSignupValidationErrors', () => {
  it('мапит одиночные и множественные поля', () => {
    expect(mapSignupValidationErrors({ email: { type: 'invalid_string' } })).toEqual({
      reason: 'invalid_email',
      field: 'email',
    });
    expect(mapSignupValidationErrors({ password: { type: 'too_small' } })).toEqual({
      reason: 'weak_password',
      field: 'password',
    });
    expect(mapSignupValidationErrors({ consent: { type: 'required' } })).toEqual({
      reason: 'terms_not_accepted',
      field: 'terms',
    });
    expect(
      mapSignupValidationErrors({ email: { type: 'required' }, password: { type: 'required' } }),
    ).toEqual({ reason: 'multiple_fields', field: 'multiple' });
  });
});

describe('mapEmailConfirmationError', () => {
  it('мапит token/expired/already', () => {
    expect(mapEmailConfirmationError(httpError(409))).toBe('already_confirmed');
    expect(mapEmailConfirmationError(httpError(410))).toBe('expired');
    expect(mapEmailConfirmationError(httpError(400))).toBe('invalid_token');
    expect(mapEmailConfirmationError({})).toBe('network_error');
  });
});

describe('mapInviteError', () => {
  it('мапит limit и validation', () => {
    expect(mapInviteError(httpError(429))).toBe('limit_reached');
    expect(mapInviteError(httpError(422))).toBe('invalid_data');
    expect(mapInviteError(httpError(500))).toBe('server_error');
  });
});

describe('mapLessonCreateError', () => {
  it('мапит student/conflict/time', () => {
    expect(mapLessonCreateError(httpError(400, 'No student in classroom'))).toBe('no_students');
    expect(mapLessonCreateError(httpError(409, 'schedule overlap'))).toBe('schedule_conflict');
    expect(mapLessonCreateError(httpError(400, 'invalid starts_at'))).toBe('invalid_time');
    expect(mapLessonCreateError(httpError(422))).toBe('validation_error');
  });
});

describe('mapCallError', () => {
  it('мапит token/permission/ice/timeout', () => {
    expect(mapCallError(httpError(401))).toBe('token_error');
    expect(mapCallError({ message: 'Permission denied' })).toBe('permission_error');
    expect(mapCallError({ message: 'ICE candidate failed' })).toBe('ice_failed');
    expect(mapCallError({ code: 'ECONNABORTED' })).toBe('timeout');
  });
});

describe('mapPermissionError', () => {
  it('мапит browser media errors', () => {
    expect(mapPermissionError({ name: 'NotAllowedError', message: 'Permission denied' })).toBe(
      'user_denied',
    );
    expect(mapPermissionError({ message: 'Camera blocked' })).toBe('browser_blocked');
    expect(mapPermissionError({ message: 'Device not found' })).toBe('device_missing');
    expect(mapPermissionError({ message: 'Device is busy' })).toBe('device_busy');
    expect(mapPermissionError({ message: 'NotSupported' })).toBe('unsupported');
  });
});
