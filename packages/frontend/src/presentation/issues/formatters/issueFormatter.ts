import type { Issue, IssueStatus, IssuePriority } from '@bealin/shared';
import type { IssueViewModel } from '../types/IssueViewModel';

const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  canceled: 'Canceled',
};

const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: 'bg-zinc-500/20 text-zinc-400',
  todo: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  done: 'bg-green-500/20 text-green-400',
  canceled: 'bg-red-500/20 text-red-400',
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  none: 'No priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  none: 'text-muted-foreground',
  low: 'text-blue-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  urgent: 'text-red-400',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatIssue(issue: Issue): IssueViewModel {
  return {
    id: issue.id.value,
    title: issue.title,
    description: issue.description,
    status: STATUS_LABELS[issue.status],
    statusColor: STATUS_COLORS[issue.status],
    priority: PRIORITY_LABELS[issue.priority],
    priorityColor: PRIORITY_COLORS[issue.priority],
    createdAt: formatDate(issue.createdAt),
  };
}

export function formatIssues(issues: Issue[]): IssueViewModel[] {
  return issues.map(formatIssue);
}
