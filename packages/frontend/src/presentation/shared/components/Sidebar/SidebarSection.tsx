import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@presentation/shared/lib/utils';

interface SidebarSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarSection({ title, defaultOpen = true, children }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="py-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1 px-2.5 py-1 text-xs font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground"
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 transition-transform duration-150',
            isOpen && 'rotate-90',
          )}
        />
        {title}
      </button>
      {isOpen && <div className="mt-0.5">{children}</div>}
    </div>
  );
}
