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
      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-secondary/50"
    >
      <StatusIcon status={issue.status} className={issue.statusColor} />
      <span className="min-w-[72px] text-xs text-muted-foreground">{issue.id}</span>
      <span className="flex-1 truncate text-sm text-foreground">{issue.title}</span>
      <span className={cn('text-xs', issue.priorityColor)} title={issue.priority}>
        {getPriorityIcon(issue.priority)}
      </span>
      <span className="text-xs text-muted-foreground">{issue.createdAt}</span>
    </Link>
  );
}

interface StatusIconProps {
  status: string;
  className?: string;
}

function StatusIcon({ status, className }: StatusIconProps) {
  const baseClass = 'h-4 w-4 flex-shrink-0';

  switch (status) {
    case 'Done':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'In Progress':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 8L8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'Canceled':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
          <path d="M6 6L10 10M10 6L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Backlog':
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );
    case 'Todo':
    default:
      return (
        <svg className={cn(baseClass, className)} viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
  }
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
