import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
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
    iid?: string;
    community?: string;
    carouselType?: 'horizontal' | 'vertical';
  }
}
