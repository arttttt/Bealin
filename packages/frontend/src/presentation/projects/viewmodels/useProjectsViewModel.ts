import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInject } from '@di/useInject';
import { DI_TOKENS } from '@di/tokens';
import type { Project } from '@domain/entities/Project';
import type { ProjectRepository } from '@domain/repositories/ProjectRepository';

interface ProjectsViewModelResult {
  readonly projects: Project[];
  readonly activeProject: Project | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly hasNoProjects: boolean;
  readonly addProject: (path: string, name?: string) => Promise<Project>;
  readonly switchProject: (id: string) => Promise<void>;
  readonly removeProject: (id: string) => Promise<void>;
  readonly isAddingProject: boolean;
  readonly isSwitchingProject: boolean;
}

export function useProjectsViewModel(): ProjectsViewModelResult {
  const queryClient = useQueryClient();
  const projectRepo = useInject<ProjectRepository>(DI_TOKENS.ProjectRepository);

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectRepo.getProjects(),
  });

  const { data: activeProject } = useQuery({
    queryKey: ['activeProject'],
    queryFn: () => projectRepo.getActiveProject(),
  });

  const addProjectMutation = useMutation({
    mutationFn: ({ path, name }: { path: string; name?: string }) =>
      projectRepo.addProject(path, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['activeProject'] });
      void queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const switchProjectMutation = useMutation({
    mutationFn: (id: string) => projectRepo.setActiveProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['activeProject'] });
      void queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const removeProjectMutation = useMutation({
    mutationFn: (id: string) => projectRepo.removeProject(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    projects: projects ?? [],
    activeProject: activeProject ?? null,
    isLoading,
    error: error ?? null,
    hasNoProjects: !isLoading && (projects?.length ?? 0) === 0,
    addProject: (path: string, name?: string) =>
      addProjectMutation.mutateAsync(
        name !== undefined ? { path, name } : { path },
      ),
    switchProject: (id: string) => switchProjectMutation.mutateAsync(id),
    removeProject: (id: string) => removeProjectMutation.mutateAsync(id),
    isAddingProject: addProjectMutation.isPending,
    isSwitchingProject: switchProjectMutation.isPending,
  };
}
