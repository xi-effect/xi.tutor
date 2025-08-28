import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/deployments/$deploymentId/enable')({
  beforeLoad: () => {
    // Выполняем редирект на главную страницу
    throw redirect({
      to: '/',
    });
  },
  component: () => null, // Компонент не нужен, так как происходит редирект
});
