import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/issues')({
  component: IssuesPage,
});

function IssuesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Issues</h1>
      <p className="mt-2 text-muted-foreground">Issue list coming soon...</p>
    </div>
  );
}
