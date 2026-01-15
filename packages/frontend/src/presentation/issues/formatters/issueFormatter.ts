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
  backlog: 'bg-status-backlog text-status-backlog-foreground',
  todo: 'bg-status-todo text-status-todo-foreground',
  in_progress: 'bg-status-in-progress text-status-in-progress-foreground',
  done: 'bg-status-done text-status-done-foreground',
  canceled: 'bg-status-canceled text-status-canceled-foreground',
};

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  none: 'No priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  none: 'text-priority-none',
  low: 'text-priority-low',
  medium: 'text-priority-medium',
  high: 'text-priority-high',
  urgent: 'text-priority-urgent',
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
    updatedAt: formatDate(issue.updatedAt),
    labels: issue.labels.map((label) => label.value),
  };
}

export function formatIssues(issues: Issue[]): IssueViewModel[] {
  return issues.map(formatIssue);
}
