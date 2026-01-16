import { useRef, useEffect, useCallback } from 'react';
import { KanbanCard } from './KanbanCard';
import { useKanbanScroll } from './KanbanScrollContext';
import type { IssueViewModel } from '../types/IssueViewModel';

interface KanbanColumnProps {
  columnKey: string;
  title: string;
  issues: IssueViewModel[];
}

export function KanbanColumn({ columnKey, title, issues }: KanbanColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getScrollPosition, setScrollPosition } = useKanbanScroll();

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.scrollTop = getScrollPosition(columnKey);
    }
  }, [columnKey, getScrollPosition]);

  const handleScroll = useCallback(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      setScrollPosition(columnKey, scrollEl.scrollTop);
    }
  }, [columnKey, setScrollPosition]);

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-lg bg-muted/10">
      <header className="flex items-center justify-between px-3 py-2">
        <span className="font-medium text-text-secondary">{title}</span>
        <span className="text-sm text-text-tertiary">{issues.length}</span>
      </header>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-2 overflow-y-auto p-2"
      >
        {issues.map((issue) => (
          <KanbanCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
