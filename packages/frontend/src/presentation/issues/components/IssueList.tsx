import { IssueRow } from './IssueRow';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssueListProps {
  issues: IssueViewModel[];
}

export function IssueList({ issues }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No issues found</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {issues.map((issue) => (
        <IssueRow key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
