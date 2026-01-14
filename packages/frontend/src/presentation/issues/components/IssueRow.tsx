import { Link } from '@tanstack/react-router';
import { cn } from '@presentation/shared/lib/utils';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssueRowProps {
  issue: IssueViewModel;
}

export function IssueRow({ issue }: IssueRowProps) {
  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: issue.id }}
      className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50">
      <span className={cn('text-sm', issue.priorityColor)} title={issue.priority}>
        {getPriorityIcon(issue.priority)}
      </span>
      <span className="min-w-[80px] text-xs text-muted-foreground">{issue.id}</span>
      <span className="flex-1 truncate text-sm text-foreground">{issue.title}</span>
      <span className={cn('rounded px-2 py-0.5 text-xs', issue.statusColor)}>
        {issue.status}
      </span>
      <span className="text-xs text-muted-foreground">{issue.createdAt}</span>
    </Link>
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
      return '○';
  }
}
