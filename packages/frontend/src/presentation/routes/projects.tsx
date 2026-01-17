import { createFileRoute } from '@tanstack/react-router';
import { Plus, FolderOpen, Check } from 'lucide-react';
import { Button } from '@presentation/shared/components/ui/button';
import { cn } from '@presentation/shared/lib/utils';
import { useProjectsViewModel } from '@presentation/projects';
import { useProjectContext } from '@presentation/shared/providers/ProjectProvider';
import { Spinner } from '@presentation/shared/components/Spinner';

export const Route = createFileRoute('/projects')({
  component: ProjectsPage,
});

function ProjectsPage() {
  const { showAddProjectDialog } = useProjectContext();
  const {
    projects,
    isLoading,
    error,
    hasNoProjects,
    switchProject,
    removeProject,
    isSwitchingProject,
  } = useProjectsViewModel();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Failed to load projects</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <Button onClick={() => showAddProjectDialog()}>
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      </div>

      {hasNoProjects ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium text-foreground">No projects yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a project to get started with Bealin
            </p>
          </div>
          <Button onClick={() => showAddProjectDialog()}>
            <Plus className="h-4 w-4" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {projects.map((project) => (
            <div
              key={project.id.value}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4 transition-colors',
                project.isActive
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border hover:bg-secondary/50',
              )}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{project.name}</span>
                    {project.isActive && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <Check className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{project.path}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!project.isActive && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void switchProject(project.id.value)}
                    disabled={isSwitchingProject}
                  >
                    Switch
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Remove "${project.name}" from the list?`)) {
                      void removeProject(project.id.value);
                    }
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
