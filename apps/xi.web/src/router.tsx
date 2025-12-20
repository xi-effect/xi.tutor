import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { ErrorPage } from 'common.ui';

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
  defaultNotFoundComponent: () => {
    return (
      <ErrorPage
        title="Страница не найдена"
        errorCode={404}
        text="В адресе есть ошибка или страница удалена"
      />
    );
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
  }
}
