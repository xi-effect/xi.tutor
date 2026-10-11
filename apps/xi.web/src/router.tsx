import { createRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { ErrorPage, LoadingScreen, NotFoundPage } from 'common.ui';
import { isStaleChunkError, isStaleChunkReloadPending, reloadOnceOnStaleChunk } from 'common.utils';

const DefaultErrorComponent = ({ error }: ErrorComponentProps) => {
  const err = error instanceof Error ? error : new Error(String(error));

  if (isStaleChunkReloadPending()) {
    return <LoadingScreen />;
  }

  if (isStaleChunkError(err) && reloadOnceOnStaleChunk(err)) {
    return <LoadingScreen />;
  }

  return (
    <ErrorPage
      title="Произошла ошибка"
      errorCode={500}
      text={err.message || 'Что-то пошло не так'}
    />
  );
};

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
  // Без pendingComponent роутер рисует пустоту, пока грузится lazy-чанк роута:
  // на мобильной сети это и есть «страница загружена, но белый экран».
  defaultPendingComponent: LoadingScreen,
  defaultPendingMs: 300,
  defaultNotFoundComponent: () => <NotFoundPage />,
  defaultErrorComponent: DefaultErrorComponent,
  defaultOnCatch: (error) => {
    reloadOnceOnStaleChunk(error);
  },
});

// Маркер для сторожа загрузки в index.html: первый роут реально отрисован.
const unsubscribeFirstResolve = router.subscribe('onResolved', () => {
  document.documentElement.dataset.appReady = '1';
  unsubscribeFirstResolve();
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }

  // Расширяем параметры поиска для всех маршрутов
  interface SearchParams {
    redirect?: string;
    profile?: string;
    carouselType?: 'horizontal' | 'vertical';
    tab?: string;
    goto?: string;
    call?: string;
    classroom?: string;
    role?: 'tutor' | 'student';
    recipient_invoice_id?: string;
    read_notification_id?: string;
    /** Диплинк расписания кабинета — см. validateSearch маршрута кабинета */
    focused_at?: string;
    schedule_dl?: string;
    event_instance_id?: string;
    repetition_mode_id?: string;
    instance_index?: string;
    /** Повторный переход на ту же доску из звонка */
    board_nav?: string;
    /** Deep link доски: id фигуры (или несколько через запятую) */
    shape?: string;
    /** Deep link доски: id треда комментария */
    comment?: string;
  }
}
