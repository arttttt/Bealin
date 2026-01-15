import { Link } from '@tanstack/react-router';
import { cn } from '@presentation/shared/lib/utils';
import type { IssueViewModel } from '../types/IssueViewModel';

interface KanbanCardProps {
  issue: IssueViewModel;
}

export function KanbanCard({ issue }: KanbanCardProps) {
  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: issue.id }}
      className="block"
    >
      <div className="rounded-md bg-background p-3 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{issue.id}</span>
          <PriorityBadge priority={issue.priority} className={issue.priorityColor} />
        </div>
        <h3 className="line-clamp-2 text-sm font-medium">{issue.title}</h3>
        {issue.labels.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <span
                key={label}
                className="rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const icon = getPriorityIcon(priority);
  if (!icon) return null;

  return (
    <span className={cn('text-xs', className)} title={priority}>
      {icon}
    </span>
  );
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'Urgent':
      return '!!!';
    case 'High':
      return '!!';
    case 'Medium':
      return '!';
    case 'Low':
      return '—';
    default:
      return '';
  }
}
