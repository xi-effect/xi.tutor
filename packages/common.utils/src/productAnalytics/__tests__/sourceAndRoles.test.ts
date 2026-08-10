import { describe, expect, it } from 'vitest';
import { inferProductAnalyticsSourceFromPathname } from '../inferSource';
import { getProductAnalyticsRole } from '../roles';
import { mapOnboardingError } from '../mapOnboardingError';

describe('inferProductAnalyticsSourceFromPathname', () => {
  it('определяет source по pathname', () => {
    expect(inferProductAnalyticsSourceFromPathname('/')).toBe('main');
    expect(inferProductAnalyticsSourceFromPathname('/main')).toBe('main');
    expect(inferProductAnalyticsSourceFromPathname('/calendar/week')).toBe('schedule');
    expect(inferProductAnalyticsSourceFromPathname('/classrooms/1')).toBe('classroom');
    expect(inferProductAnalyticsSourceFromPathname('/materials')).toBe('materials');
    expect(inferProductAnalyticsSourceFromPathname('/board/1')).toBe('materials');
    expect(inferProductAnalyticsSourceFromPathname('/call/x')).toBe('call');
    expect(inferProductAnalyticsSourceFromPathname('/invite')).toBe('invite');
    expect(inferProductAnalyticsSourceFromPathname('/settings')).toBe('unknown');
  });
});

describe('getProductAnalyticsRole', () => {
  it('мапит layout в role', () => {
    expect(getProductAnalyticsRole('tutor')).toBe('tutor');
    expect(getProductAnalyticsRole('student')).toBe('student');
    expect(getProductAnalyticsRole('parent')).toBe('parent');
    expect(getProductAnalyticsRole(null)).toBe('unknown');
  });
});

describe('mapOnboardingError', () => {
  it('мапит типовые ошибки', () => {
    expect(mapOnboardingError({ response: { status: 422 } })).toBe('validation_error');
    expect(mapOnboardingError({ response: { status: 500 } })).toBe('server_error');
    expect(mapOnboardingError({ code: 'ERR_NETWORK' })).toBe('network_error');
    expect(mapOnboardingError(null)).toBe('unknown');
  });
});
