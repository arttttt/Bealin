import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface KanbanScrollContextValue {
  getScrollPosition: (columnKey: string) => number;
  setScrollPosition: (columnKey: string, position: number) => void;
}

const KanbanScrollContext = createContext<KanbanScrollContextValue | null>(null);

export function KanbanScrollProvider({ children }: { children: ReactNode }) {
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({});

  const getScrollPosition = useCallback(
    (columnKey: string) => scrollPositions[columnKey] ?? 0,
    [scrollPositions]
  );

  const setScrollPosition = useCallback((columnKey: string, position: number) => {
    setScrollPositions((prev) => ({ ...prev, [columnKey]: position }));
  }, []);

  return (
    <KanbanScrollContext.Provider value={{ getScrollPosition, setScrollPosition }}>
      {children}
    </KanbanScrollContext.Provider>
  );
}

export function useKanbanScroll() {
  const context = useContext(KanbanScrollContext);
  if (!context) {
    throw new Error('useKanbanScroll must be used within KanbanScrollProvider');
  }
  return context;
}
