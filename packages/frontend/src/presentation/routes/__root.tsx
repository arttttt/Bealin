import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { MainLayout } from '@presentation/shared/layouts/MainLayout';
import { KanbanScrollProvider } from '@presentation/issues/components/KanbanScrollContext';
import { ProjectProvider } from '@presentation/shared/providers/ProjectProvider';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <ProjectProvider>
      <KanbanScrollProvider>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </KanbanScrollProvider>
      <TanStackRouterDevtools />
    </ProjectProvider>
  );
}
