import { useQuery } from '@tanstack/react-query';
import { IssueId } from '@bealin/shared';
import { useInject } from '@di/useInject';
import { GetIssueUseCase } from '@domain/usecases/GetIssueUseCase';
import { formatIssue } from '../formatters/issueFormatter';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssueDetailViewModelResult {
  readonly issue: IssueViewModel | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly isNotFound: boolean;
}

export function useIssueDetailViewModel(issueId: string): IssueDetailViewModelResult {
  const getIssue = useInject(GetIssueUseCase);

  const { data, isLoading, error, isFetched } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => getIssue.execute(new IssueId(issueId)),
  });

  return {
    issue: data ? formatIssue(data) : null,
    isLoading,
    error: error ?? null,
    isNotFound: isFetched && !isLoading && !error && data === null,
  };
}
