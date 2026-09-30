import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { ErrorPage, LoadingScreen, NotFoundPage } from 'common.ui';
import { isStaleChunkError, isStaleChunkReloadPending, reloadOnceOnStaleChunk } from 'common.utils';

const DefaultErrorComponent = ({ error }: { error: Error }) => {
  if (isStaleChunkReloadPending()) {
    return <LoadingScreen />;
  }

  if (isStaleChunkError(error) && reloadOnceOnStaleChunk(error)) {
    return <LoadingScreen />;
  }

  return (
    <ErrorPage
      title="Произошла ошибка"
      errorCode={500}
      text={error.message || 'Что-то пошло не так'}
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
  defaultNotFoundComponent: () => <NotFoundPage />,
  defaultErrorComponent: DefaultErrorComponent,
  defaultOnCatch: (error) => {
    reloadOnceOnStaleChunk(error);
  },
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
