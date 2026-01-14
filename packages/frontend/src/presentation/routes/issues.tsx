import { createFileRoute } from '@tanstack/react-router';
import { IssuesPage } from '@presentation/issues/IssuesPage';

export const Route = createFileRoute('/issues')({
  component: IssuesPage,
});
