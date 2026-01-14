import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { MainLayout } from '@presentation/shared/layouts/MainLayout';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="dark">
      <MainLayout>
        <Outlet />
      </MainLayout>
      <TanStackRouterDevtools />
    </div>
  );
}
