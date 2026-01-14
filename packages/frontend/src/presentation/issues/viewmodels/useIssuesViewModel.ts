import { useQuery } from '@tanstack/react-query';
import { useInject } from '@di/useInject';
import { ListIssuesUseCase } from '@domain/usecases/ListIssuesUseCase';
import { formatIssues } from '../formatters/issueFormatter';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssuesViewModelResult {
  readonly issues: IssueViewModel[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useIssuesViewModel(): IssuesViewModelResult {
  const listIssues = useInject(ListIssuesUseCase);

  const { data, isLoading, error } = useQuery({
    queryKey: ['issues'],
    queryFn: () => listIssues.execute(),
  });

  return {
    issues: data ? formatIssues(data) : [],
    isLoading,
    error: error ?? null,
  };
}
