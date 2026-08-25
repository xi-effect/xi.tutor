import { describe, expect, it } from 'vitest';
import { resolvePostOnboardingNavigation } from '../postOnboardingNavigation';

describe('resolvePostOnboardingNavigation', () => {
  it('ведёт на invite из localStorage и помечает очистку', () => {
    expect(resolvePostOnboardingNavigation(undefined, 'stored-1')).toEqual({
      to: '/invite/$inviteId',
      params: { inviteId: 'stored-1' },
      clearStoredInvite: true,
    });
  });

  it('ведёт на invite из search без очистки storage', () => {
    expect(resolvePostOnboardingNavigation('search-2', null)).toEqual({
      to: '/invite/$inviteId',
      params: { inviteId: 'search-2' },
      clearStoredInvite: false,
    });
  });

  it('предпочитает stored invite search', () => {
    expect(resolvePostOnboardingNavigation('search-2', 'stored-1')).toEqual({
      to: '/invite/$inviteId',
      params: { inviteId: 'stored-1' },
      clearStoredInvite: true,
    });
  });

  it('ведёт на / без invite', () => {
    expect(resolvePostOnboardingNavigation(undefined, null)).toEqual({
      to: '/',
      clearStoredInvite: false,
    });
  });
});
