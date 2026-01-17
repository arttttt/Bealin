import type { Issue, IssueDependency, IssueStatus, IssuePriority, IssueType } from '@bealin/shared';
import type { IssueViewModel, DependencyViewModel } from '../types/IssueViewModel';

const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  canceled: 'Canceled',
};

const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: 'text-status-backlog-foreground',
  todo: 'text-status-todo-foreground',
  in_progress: 'text-status-in-progress-foreground',
  done: 'text-status-done-foreground',
  canceled: 'text-status-canceled-foreground',
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

const TYPE_LABELS: Record<IssueType, string> = {
  bug: 'Bug',
  feature: 'Feature',
  task: 'Task',
  epic: 'Epic',
  chore: 'Chore',
};

const TYPE_COLORS: Record<IssueType, string> = {
  bug: 'text-type-bug',
  feature: 'text-type-feature',
  task: 'text-type-task',
  epic: 'text-type-epic',
  chore: 'text-type-chore',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDependency(dep: IssueDependency): DependencyViewModel {
  return {
    id: dep.id.value,
    title: dep.title,
    status: STATUS_LABELS[dep.status],
    statusColor: STATUS_COLORS[dep.status],
    type: TYPE_LABELS[dep.type],
    typeColor: TYPE_COLORS[dep.type],
  };
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
    type: TYPE_LABELS[issue.type],
    typeColor: TYPE_COLORS[issue.type],
    createdAt: formatDate(issue.createdAt),
    updatedAt: formatDate(issue.updatedAt),
    labels: issue.labels.map((label) => label.value),
    blocks: issue.blocks.map(formatDependency),
    blockedBy: issue.blockedBy.map(formatDependency),
  };
}

export function formatIssues(issues: Issue[]): IssueViewModel[] {
  return issues.map(formatIssue);
}
