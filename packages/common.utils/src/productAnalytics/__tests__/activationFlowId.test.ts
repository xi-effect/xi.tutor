import { afterEach, describe, expect, it } from 'vitest';
import {
  beginSignupActivationFlow,
  completeActivationFlow,
  getActivationFlowId,
  getOrCreateActivationFlowId,
  resetActivationFlowMemory,
  setActivationAnalyticsUser,
} from '../activationFlowId';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, String(value));
    },
  };
}

function installWindow(session: Storage, local: Storage) {
  (globalThis as { window?: Window }).window = {
    sessionStorage: session,
    localStorage: local,
  } as Window;
}

describe('activation_flow_id', () => {
  const local = createMemoryStorage();

  afterEach(() => {
    resetActivationFlowMemory();
    local.clear();
    delete (globalThis as { window?: unknown }).window;
  });

  it('держит один id на попытку и выдаёт новый после успешной регистрации', () => {
    installWindow(createMemoryStorage(), local);

    const viewed = getOrCreateActivationFlowId();
    const submit = beginSignupActivationFlow();
    expect(submit).toBe(viewed);

    expect(completeActivationFlow(11)).toBe(viewed);
    setActivationAnalyticsUser(null);

    const nextSignup = getOrCreateActivationFlowId();
    expect(nextSignup).not.toBe(viewed);
    expect(completeActivationFlow(12)).toBe(nextSignup);

    setActivationAnalyticsUser(11);
    expect(getActivationFlowId()).toBe(viewed);
    setActivationAnalyticsUser(12);
    expect(getActivationFlowId()).toBe(nextSignup);
    expect(getActivationFlowId()).not.toBe(viewed);
  });

  it('не отдаёт завершённый flow другому user_id', () => {
    installWindow(createMemoryStorage(), local);

    const first = beginSignupActivationFlow();
    expect(completeActivationFlow('user-a')).toBe(first);

    resetActivationFlowMemory();
    const stolen = completeActivationFlow('user-b');
    expect(stolen).not.toBe(first);

    setActivationAnalyticsUser('user-a');
    expect(getActivationFlowId()).toBe(first);
    setActivationAnalyticsUser('user-b');
    expect(getActivationFlowId()).toBe(stolen);
  });

  it('не смешивает попытки двух вкладок', () => {
    const sessionA = createMemoryStorage();
    const sessionB = createMemoryStorage();
    installWindow(sessionA, local);

    const tabA = beginSignupActivationFlow();
    resetActivationFlowMemory();
    installWindow(sessionB, local);
    const tabB = beginSignupActivationFlow();

    expect(tabB).not.toBe(tabA);

    resetActivationFlowMemory();
    installWindow(sessionA, local);
    expect(completeActivationFlow(1)).toBe(tabA);

    resetActivationFlowMemory();
    installWindow(sessionB, local);
    expect(completeActivationFlow(2)).toBe(tabB);

    setActivationAnalyticsUser(1);
    expect(getActivationFlowId()).toBe(tabA);
    setActivationAnalyticsUser(2);
    expect(getActivationFlowId()).toBe(tabB);
  });

  it('после logout не подмешивает чужой flow в анонимные события', () => {
    installWindow(createMemoryStorage(), local);
    const id = beginSignupActivationFlow();
    completeActivationFlow(5);
    setActivationAnalyticsUser(null);

    expect(getActivationFlowId()).toBeUndefined();
    setActivationAnalyticsUser(5);
    expect(getActivationFlowId()).toBe(id);
  });
});
