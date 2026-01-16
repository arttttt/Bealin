import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { MainLayout } from '@presentation/shared/layouts/MainLayout';
import { KanbanScrollProvider } from '@presentation/issues/components/KanbanScrollContext';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="dark">
      <KanbanScrollProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </KanbanScrollProvider>
      <TanStackRouterDevtools />
    </div>
  );
}
