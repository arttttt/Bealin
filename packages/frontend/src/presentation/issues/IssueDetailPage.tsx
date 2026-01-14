import { Spinner } from '@presentation/shared/components/Spinner';
import { IssueDetail } from './components/IssueDetail';
import { useIssueDetailViewModel } from './viewmodels/useIssueDetailViewModel';

interface IssueDetailPageProps {
  issueId: string;
}

export function IssueDetailPage({ issueId }: IssueDetailPageProps) {
  const { issue, isLoading, error, isNotFound } = useIssueDetailViewModel(issueId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">Error loading issue: {error.message}</p>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Issue not found</p>
      </div>
    );
  }

  if (!issue) {
    return null;
  }

  return (
    <div className="h-full overflow-auto">
      <IssueDetail issue={issue} />
    </div>
  );
}
