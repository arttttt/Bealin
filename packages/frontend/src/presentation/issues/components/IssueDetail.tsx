import { cn } from '@presentation/shared/lib/utils';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssueDetailProps {
  issue: IssueViewModel;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{issue.id}</span>
          <span className={cn('rounded px-2 py-0.5 text-xs', issue.statusColor)}>
            {issue.status}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">{issue.title}</h1>
      </header>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Priority:</span>
          <span className={issue.priorityColor}>{issue.priority}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Created:</span>
          <span className="text-foreground">{issue.createdAt}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Updated:</span>
          <span className="text-foreground">{issue.updatedAt}</span>
        </div>
      </div>

      {issue.labels.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Labels:</span>
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <span
                key={label}
                className="rounded bg-accent px-2 py-0.5 text-xs text-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {issue.description && (
        <div className="border-t border-border pt-4">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Description</h2>
          <div className="whitespace-pre-wrap text-sm text-foreground">{issue.description}</div>
        </div>
      )}
    </div>
  );
}
