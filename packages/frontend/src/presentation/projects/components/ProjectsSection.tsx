import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@presentation/shared/lib/utils';
import { SidebarSection } from '@presentation/shared/components/Sidebar/SidebarSection';
import { useProjectsViewModel } from '../viewmodels/useProjectsViewModel';
import { AddProjectDialog } from './AddProjectDialog';
import { ProjectItem } from './ProjectItem';

export function ProjectsSection() {
  const { projects, activeProject, switchProject, isLoading, isSwitchingProject } =
    useProjectsViewModel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <SidebarSection title="Projects">
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-sidebar-foreground/50" />
        </div>
      ) : (
        <>
          <div className="space-y-0.5 px-2">
            {projects.map((project) => (
              <ProjectItem
                key={project.id.value}
                project={project}
                isActive={activeProject !== null && project.id.equals(activeProject.id)}
                onSelect={() => {
                  if (!isSwitchingProject) {
                    void switchProject(project.id.value);
                  }
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsAddDialogOpen(true)}
            className={cn(
              'mx-2 mt-1 flex w-[calc(100%-16px)] items-center gap-2 rounded-md px-2.5 py-1.5 text-sm',
              'text-sidebar-foreground/60 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground',
            )}
          >
            <Plus className="h-4 w-4" />
            <span>Add project...</span>
          </button>
        </>
      )}

      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onProjectAdded={() => setIsAddDialogOpen(false)}
      />
    </SidebarSection>
  );
}
