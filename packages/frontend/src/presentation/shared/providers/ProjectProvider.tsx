import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
 * Automatically shows Add Project dialog when no projects exist.
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const { projects, activeProject, isLoading, hasNoProjects } = useProjectsViewModel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Auto-show dialog when no projects
  useEffect(() => {
    if (!isLoading && hasNoProjects) {
      setIsAddDialogOpen(true);
    }
  }, [isLoading, hasNoProjects]);

  const showAddProjectDialog = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    // Don't allow closing if no projects exist
    if (projects.length > 0) {
      setIsAddDialogOpen(false);
    }
  }, [projects.length]);

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
        preventClose={hasNoProjects}
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
