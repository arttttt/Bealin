/**
 * Minimal view model for dependency display.
 */
export interface DependencyViewModel {
  readonly id: string;
  readonly title: string;
  readonly status: string;
  readonly statusColor: string;
  readonly type: string;
  readonly typeColor: string;
}

export interface IssueViewModel {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly statusColor: string;
  readonly priority: string;
  readonly priorityColor: string;
  readonly type: string;
  readonly typeColor: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly labels: readonly string[];
  readonly blocks: readonly DependencyViewModel[];
  readonly blockedBy: readonly DependencyViewModel[];
}
