/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { SettingsEntry } from 'modules.profile';
import { Suspense } from 'react';

const validateSettingsSearch = (search: Record<string, unknown>) => ({
  call: typeof search.call === 'string' && search.call.length > 0 ? search.call : undefined,
  period: typeof search.period === 'string' && search.period.length > 0 ? search.period : undefined,
});

const SettingsIndexPage = () => (
  <Suspense fallback={<LoadingScreen />}>
    <SettingsEntry />
  </Suspense>
);

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/settings/')({
  validateSearch: validateSettingsSearch,
  head: () => ({
    meta: [{ title: 'sovlium | Настройки' }],
  }),
  component: SettingsIndexPage,
});
