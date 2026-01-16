import { Folder, X } from 'lucide-react';
import { cn } from '@presentation/shared/lib/utils';
import type { Project } from '@domain/entities/Project';

interface ProjectItemProps {
  project: Project;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function ProjectItem({ project, isActive, onSelect, onRemove }: ProjectItemProps) {
  return (
    <div
      className={cn(
        'group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
        'hover:bg-sidebar-accent/30',
        isActive && 'bg-sidebar-accent/60',
      )}
    >
      <button
        onClick={onSelect}
        className="flex flex-1 items-center gap-2 min-w-0"
      >
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-sidebar-accent/50 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-opacity"
        title="Remove project"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
