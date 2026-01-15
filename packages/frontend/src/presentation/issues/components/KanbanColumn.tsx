import { KanbanCard } from './KanbanCard';
import type { IssueViewModel } from '../types/IssueViewModel';

interface KanbanColumnProps {
  title: string;
  issues: IssueViewModel[];
}

export function KanbanColumn({ title, issues }: KanbanColumnProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/10">
      <header className="flex items-center justify-between px-3 py-2">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{issues.length}</span>
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {issues.map((issue) => (
          <KanbanCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
