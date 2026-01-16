import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ChevronRight, Folder, LayoutList, LayoutGrid } from 'lucide-react';
import { cn } from '@presentation/shared/lib/utils';
import type { Project } from '@domain/entities/Project';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
}

export function ProjectItem({ project, isActive, onSelect }: ProjectItemProps) {
  const [isExpanded, setIsExpanded] = useState(isActive);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleClick = () => {
    if (!isActive) {
      onSelect();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
          'hover:bg-sidebar-accent/30',
          isActive && 'bg-sidebar-accent/60',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 flex-shrink-0 text-sidebar-foreground/50 transition-transform duration-150',
            isExpanded && 'rotate-90',
          )}
        />
        <Folder className="h-4 w-4 flex-shrink-0 text-sidebar-foreground/70" />
        <span
          className={cn(
            'flex-1 truncate text-left',
            isActive ? 'text-sidebar-foreground' : 'text-sidebar-foreground/70',
          )}
        >
          {project.name}
        </span>
      </button>

      {isExpanded && (
        <div className="ml-5 mt-0.5 space-y-0.5">
          <Link
            to="/issues"
            className={cn(
              'flex items-center gap-2 rounded-md px-2.5 py-1 text-sm transition-colors',
              'hover:bg-sidebar-accent/30',
              currentPath === '/issues' || currentPath.startsWith('/issues/')
                ? 'bg-sidebar-accent/40 text-sidebar-foreground'
                : 'text-sidebar-foreground/60',
            )}
          >
            <LayoutList className="h-3.5 w-3.5" />
            <span>Issues</span>
          </Link>
          <Link
            to="/issues"
            className={cn(
              'flex items-center gap-2 rounded-md px-2.5 py-1 text-sm transition-colors',
              'hover:bg-sidebar-accent/30 text-sidebar-foreground/60',
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Board</span>
          </Link>
        </div>
      )}
    </div>
  );
}
