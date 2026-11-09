export const subscriptionSettingsSearch = (search: unknown, callId?: string) => {
  const source = search && typeof search === 'object' ? (search as Record<string, unknown>) : {};
  const callFromSearch = typeof source.call === 'string' && source.call ? source.call : undefined;
  const period = typeof source.period === 'string' && source.period ? source.period : undefined;

  return { call: callFromSearch || callId || undefined, period };
};
