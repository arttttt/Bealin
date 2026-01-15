import { createFileRoute } from '@tanstack/react-router';
import { IssueDetailPage } from '@presentation/issues/IssueDetailPage';

export const Route = createFileRoute('/issues_/$issueId')({
  component: IssueDetailRouteComponent,
});

function IssueDetailRouteComponent() {
  const { issueId } = Route.useParams();
  return <IssueDetailPage issueId={issueId} />;
}
