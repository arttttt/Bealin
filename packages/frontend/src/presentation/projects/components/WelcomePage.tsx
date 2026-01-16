import { FolderOpen } from 'lucide-react';
import { Button } from '@presentation/shared/components/ui/button';
import { useProjectContext } from '@presentation/shared/providers/ProjectProvider';

/**
 * Welcome page shown when no projects exist.
 * Provides a friendly introduction and button to add a project.
 */
export function WelcomePage() {
  const { showAddProjectDialog } = useProjectContext();

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Welcome to Beads
          </h1>
          <p className="text-muted-foreground">
            Get started by adding a project
          </p>
        </div>
        <Button onClick={showAddProjectDialog} size="lg">
          <FolderOpen className="h-5 w-5" />
          Add Project
        </Button>
      </div>
    </div>
  );
}
