import { KanbanColumn } from './KanbanColumn';
import type { IssueViewModel } from '../types/IssueViewModel';

interface KanbanBoardProps {
  issues: IssueViewModel[];
}

const COLUMNS = [
  { key: 'Backlog', title: 'Backlog' },
  { key: 'Todo', title: 'Todo' },
  { key: 'In Progress', title: 'In Progress' },
  { key: 'Done', title: 'Done' },
  { key: 'Canceled', title: 'Canceled' },
] as const;

function groupByStatus(issues: IssueViewModel[]): Record<string, IssueViewModel[]> {
  const groups: Record<string, IssueViewModel[]> = {};

  for (const column of COLUMNS) {
    groups[column.key] = [];
  }

  for (const issue of issues) {
    const group = groups[issue.status];
    if (group) {
      group.push(issue);
    }
  }

  return groups;
}

export function KanbanBoard({ issues }: KanbanBoardProps) {
  const columns = groupByStatus(issues);

  return (
    <div className="flex h-full gap-4 overflow-x-auto p-4">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.key}
          columnKey={column.key}
          title={column.title}
          issues={columns[column.key] ?? []}
        />
      ))}
    </div>
  );
}
