import { cn } from '@presentation/shared/lib/utils';
import type { IssueViewModel } from '../types/IssueViewModel';

interface IssueDetailProps {
  issue: IssueViewModel;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col gap-8 p-8">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{issue.id}</span>
          </div>
          <h1 className="text-xl font-medium text-foreground">{issue.title}</h1>
        </header>

        {issue.description && (
          <div className="flex-1">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {issue.description}
            </div>
          </div>
        )}

        {!issue.description && (
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Add a description...</p>
          </div>
        )}
      </div>

      <aside className="w-64 border-l border-border-subtle">
        <div className="px-4 py-3">
          <h2 className="text-xs font-medium text-text-secondary">
            Properties
          </h2>
        </div>
        <div className="flex flex-col">
          <PropertyRow label="Status">
            <div className="flex items-center gap-1.5">
              <StatusIcon status={issue.status} className={issue.statusColor} />
              <span className="text-[13px] text-text-primary">{issue.status}</span>
            </div>
          </PropertyRow>

          <PropertyRow label="Priority">
            <span className={cn('text-[13px]', issue.priorityColor)}>{issue.priority}</span>
          </PropertyRow>

          <div className="mx-4 border-t border-border-subtle" />

          <PropertyRow label="Created">
            <span className="text-[13px] text-text-primary">{issue.createdAt}</span>
          </PropertyRow>

          <PropertyRow label="Updated">
            <span className="text-[13px] text-text-primary">{issue.updatedAt}</span>
          </PropertyRow>

          {issue.labels.length > 0 && (
            <>
              <div className="mx-4 border-t border-border-subtle" />
              <PropertyRow label="Labels">
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded bg-secondary px-1.5 py-0.5 text-xs text-text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </PropertyRow>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

interface PropertyRowProps {
  label: string;
  children: React.ReactNode;
}

function PropertyRow({ label, children }: PropertyRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-background-hover">
      <span className="text-[13px] text-text-secondary">{label}</span>
      {children}
    </div>
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
