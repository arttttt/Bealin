import { createContext, useContext, useState, useCallback } from 'react';
import { useProjectsViewModel } from '@presentation/projects/viewmodels/useProjectsViewModel';
import { AddProjectDialog } from '@presentation/projects/components/AddProjectDialog';
import type { Project } from '@domain/entities/Project';

interface ProjectContextValue {
  readonly activeProject: Project | null;
  readonly hasProjects: boolean;
  readonly isLoading: boolean;
  readonly showAddProjectDialog: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for project-related state.
 * Manages the Add Project dialog globally.
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const { projects, activeProject, isLoading } = useProjectsViewModel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const showAddProjectDialog = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const handleProjectAdded = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const value: ProjectContextValue = {
    activeProject: activeProject,
    hasProjects: projects.length > 0,
    isLoading,
    showAddProjectDialog,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}

      {/* Global Add Project Dialog */}
      <AddProjectDialog
        isOpen={isAddDialogOpen}
        onClose={handleClose}
        onProjectAdded={handleProjectAdded}
      />
    </ProjectContext.Provider>
  );
}

/**
 * Hook to access project context.
 * Must be used within ProjectProvider.
 */
export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within ProjectProvider');
  }
  return context;
}
