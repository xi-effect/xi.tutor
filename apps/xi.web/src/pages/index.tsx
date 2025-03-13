import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: ({ context, location }) => {
    console.log('IndexRoute', context, location);
    // if (!context.auth.isAuthenticated) {
    //   throw redirect({
    //     to: '/signin',
    //     search: {
    //       redirect: location.href,
    //     },
    //   });
    // }
  },
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  );
}
