import { Spinner } from '@presentation/shared/components/Spinner';
import { KanbanBoard } from './components/KanbanBoard';
import { useIssuesViewModel } from './viewmodels/useIssuesViewModel';

export function IssuesPage() {
  const { issues, isLoading, error } = useIssuesViewModel();

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
        <p className="text-destructive">Error loading issues: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Issues</h1>
        <span className="text-sm text-muted-foreground">{issues.length} issues</span>
      </header>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard issues={issues} />
      </div>
    </div>
  );
}
