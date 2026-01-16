import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useInject } from '@di/useInject';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase';
import { NoActiveProjectError } from '@data/errors/NoActiveProjectError';
import { useProjectContext } from '@presentation/shared/providers/ProjectProvider';
import { formatIssues } from '../formatters/issueFormatter';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssuesViewModelResult {
  readonly issues: IssueViewModel[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useIssuesViewModel(): IssuesViewModelResult {
  const listIssues = useInject(ListIssuesUseCase);
  const { showAddProjectDialog } = useProjectContext();

  const { data, isLoading, error } = useQuery({
    queryKey: ['issues'],
    queryFn: () => listIssues.execute(),
    retry: (failureCount, err) => {
      // Don't retry NO_ACTIVE_PROJECT errors
      if (err instanceof NoActiveProjectError) return false;
      return failureCount < 3;
    },
  });

  // Handle NO_ACTIVE_PROJECT error
  useEffect(() => {
    if (error instanceof NoActiveProjectError) {
      showAddProjectDialog();
    }
  }, [error, showAddProjectDialog]);

  return {
    issues: data ? formatIssues(data) : [],
    isLoading,
    error: error ?? null,
  };
}
