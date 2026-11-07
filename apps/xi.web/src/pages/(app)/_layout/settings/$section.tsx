/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createFileRoute } from '@tanstack/react-router';
import { LoadingScreen } from 'common.ui';
import { SettingsSection } from 'modules.profile';
import { Suspense } from 'react';

const SECTION_TITLES: Record<string, string> = {
  personal: 'sovlium | Личные данные',
  subscription: 'sovlium | Тариф и подписка',
  appearance: 'sovlium | Персонализация',
  schedule: 'sovlium | Расписание',
  security: 'sovlium | Безопасность',
  notifications: 'sovlium | Уведомления',
  'sound-and-video': 'sovlium | Звук и видео',
  effects: 'sovlium | Эффекты',
  tags: 'sovlium | Теги',
  board: 'sovlium | Доска',
  report: 'sovlium | Отчёт',
};

const validateSettingsSearch = (search: Record<string, unknown>) => ({
  call: typeof search.call === 'string' && search.call.length > 0 ? search.call : undefined,
  period: typeof search.period === 'string' && search.period.length > 0 ? search.period : undefined,
});

// @ts-ignore
export const Route = createFileRoute('/(app)/_layout/settings/$section')({
  validateSearch: validateSettingsSearch,
  head: ({ params }: { params: { section: string } }) => ({
    meta: [{ title: SECTION_TITLES[params.section] ?? 'sovlium | Настройки' }],
  }),
  component: SettingsSectionPage,
});

function SettingsSectionPage() {
  const { section } = Route.useParams();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <SettingsSection slug={section} />
    </Suspense>
  );
}
