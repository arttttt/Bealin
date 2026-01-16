import { Sidebar } from '@presentation/shared/components/Sidebar';
import { WelcomePage } from '@presentation/projects/components/WelcomePage';
import { useProjectContext } from '@presentation/shared/providers/ProjectProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { hasProjects, isLoading } = useProjectContext();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {!isLoading && !hasProjects ? <WelcomePage /> : children}
      </main>
    </div>
  );
}
