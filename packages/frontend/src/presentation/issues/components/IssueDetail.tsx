import { Link } from '@tanstack/react-router';
import { cn } from '@presentation/shared/lib/utils';
import { TypeIcon } from '@presentation/shared/components/icons/TypeIcon';
import type { IssueViewModel, DependencyViewModel } from '../types/IssueViewModel';
import { IssueDetailBreadcrumb } from './IssueDetailBreadcrumb';

interface IssueDetailProps {
  issue: IssueViewModel;
}

export function IssueDetail({ issue }: IssueDetailProps) {
  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col gap-8 p-8">
        <header className="flex flex-col gap-3">
          <IssueDetailBreadcrumb issueId={issue.id} />
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

        {issue.type === 'Epic' && (
          <ChildrenSection children={issue.children} />
        )}

        {(issue.blockedBy.length > 0 || issue.blocks.length > 0) && (
          <div className="flex flex-col gap-4">
            {issue.blockedBy.length > 0 && (
              <DependencySection title="Blocked by" dependencies={issue.blockedBy} />
            )}
            {issue.blocks.length > 0 && (
              <DependencySection title="Blocks" dependencies={issue.blocks} />
            )}
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

          <PropertyRow label="Type">
            <div className="flex items-center gap-1.5">
              <TypeIcon type={issue.type} className={issue.typeColor} />
              <span className="text-[13px] text-text-primary">{issue.type}</span>
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

interface DependencySectionProps {
  title: string;
  dependencies: readonly DependencyViewModel[];
}

function DependencySection({ title, dependencies }: DependencySectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-text-secondary">
        {title}
      </h3>
      <div className="rounded-md border border-border-subtle">
        {dependencies.map((dep) => (
          <DependencyItem key={dep.id} dependency={dep} />
        ))}
      </div>
    </div>
  );
}

interface DependencyItemProps {
  dependency: DependencyViewModel;
}

function DependencyItem({ dependency }: DependencyItemProps) {
  const truncatedTitle =
    dependency.title.length > 40
      ? `${dependency.title.slice(0, 40)}...`
      : dependency.title;

  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: dependency.id }}
      className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-background-hover"
    >
      <StatusIcon status={dependency.status} className={dependency.statusColor} />
      <span className="text-[13px] font-medium text-text-secondary">
        {dependency.id.toUpperCase()}
      </span>
      <span className="truncate text-[13px] text-text-primary" title={dependency.title}>
        {truncatedTitle}
      </span>
    </Link>
  );
}

interface ChildrenSectionProps {
  children: readonly DependencyViewModel[];
}

function ChildrenSection({ children }: ChildrenSectionProps) {
  // Sort children: In Progress first, then Todo, then Done/Canceled
  const statusOrder: Record<string, number> = {
    'In Progress': 0,
    'Todo': 1,
    'Backlog': 2,
    'Done': 3,
    'Canceled': 4,
  };

  const sortedChildren = [...children].sort((a, b) => {
    const orderA = statusOrder[a.status] ?? 99;
    const orderB = statusOrder[b.status] ?? 99;
    return orderA - orderB;
  });

  const completedCount = children.filter(
    (child) => child.status === 'Done' || child.status === 'Canceled'
  ).length;
  const totalCount = children.length;

  if (totalCount === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-sm font-medium text-text-primary">Sub-issues</h3>
        <p className="mt-2 text-sm italic text-text-tertiary">No sub-issues yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-text-primary">Sub-issues</h3>
        <span className="text-sm text-text-secondary">
          ({completedCount}/{totalCount})
        </span>
      </div>
      <div className="mt-2 rounded-lg border border-border-subtle">
        {sortedChildren.map((child, index) => (
          <ChildItem
            key={child.id}
            child={child}
            isLast={index === sortedChildren.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface ChildItemProps {
  child: DependencyViewModel;
  isLast: boolean;
}

function ChildItem({ child, isLast }: ChildItemProps) {
  const truncatedTitle =
    child.title.length > 50
      ? `${child.title.slice(0, 50)}...`
      : child.title;

  return (
    <Link
      to="/issues/$issueId"
      params={{ issueId: child.id }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 hover:bg-background-hover',
        !isLast && 'border-b border-border-subtle'
      )}
    >
      <StatusIcon status={child.status} className={child.statusColor} />
      <span className="text-[13px] font-medium text-text-secondary">
        {child.id.toUpperCase()}
      </span>
      <span className="truncate text-[13px] text-text-primary" title={child.title}>
        {truncatedTitle}
      </span>
    </Link>
  );
}
