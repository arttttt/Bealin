import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook that connects to the backend SSE endpoint and invalidates
 * TanStack Query caches when beads data changes.
 *
 * This enables real-time updates without polling.
 */
export function useBeadsEvents(): void {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const connect = () => {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource('/api/events');
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', () => {
        // Connection established
      });

      eventSource.addEventListener('issues-changed', () => {
        // Invalidate all issue-related queries to trigger refetch
        void queryClient.invalidateQueries({ queryKey: ['issues'] });
        void queryClient.invalidateQueries({ queryKey: ['labels'] });
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;

        // Reconnect after delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000); // 3 second reconnect delay
      };
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [queryClient]);
}
