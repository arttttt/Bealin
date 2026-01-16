import { watch, type FSWatcher } from 'chokidar';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { FastifyReply } from 'fastify';

/**
 * Debounce utility function.
 */
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * SSE client wrapper for Fastify reply.
 */
interface SSEClient {
  id: string;
  reply: FastifyReply;
}

/**
 * Service for watching file system changes in the active project's .beads directory.
 * Singleton - maintains state across requests.
 *
 * Notifies connected SSE clients when issues or labels change.
 */
export class BeadsWatcher {
  private static instance: BeadsWatcher | null = null;

  private watcher: FSWatcher | null = null;
  private clients: Map<string, SSEClient> = new Map();
  private currentProjectPath: string | null = null;

  /**
   * Debounced notification to batch rapid file changes.
   * 100ms delay to handle multiple files changing in quick succession.
   */
  private notifyClientsDebounced = debounce(() => {
    this.notifyClients();
  }, 100);

  private constructor() {}

  /**
   * Get singleton instance.
   */
  static getInstance(): BeadsWatcher {
    if (!BeadsWatcher.instance) {
      BeadsWatcher.instance = new BeadsWatcher();
    }
    return BeadsWatcher.instance;
  }

  /**
   * Start watching a project's .beads directory.
   * Stops watching previous project if any.
   *
   * @param projectPath - Absolute path to the project folder
   */
  async watchProject(projectPath: string): Promise<void> {
    // Stop existing watcher
    await this.stopWatching();

    const beadsPath = join(projectPath, '.beads');

    // Don't watch if .beads doesn't exist
    if (!existsSync(beadsPath)) {
      this.currentProjectPath = null;
      return;
    }

    this.currentProjectPath = projectPath;

    // Watch all .jsonl files in .beads directory
    const watchPattern = join(beadsPath, '**', '*.jsonl');

    this.watcher = watch(watchPattern, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (_event: string, _path: string) => {
      this.notifyClientsDebounced();
    });

    this.watcher.on('error', (error: unknown) => {
      console.error('BeadsWatcher error:', error);
    });
  }

  /**
   * Stop watching the current project.
   */
  async stopWatching(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.currentProjectPath = null;
  }

  /**
   * Register an SSE client to receive change notifications.
   *
   * @param reply - Fastify reply object for SSE streaming
   * @returns Client ID for cleanup
   */
  addClient(reply: FastifyReply): string {
    const clientId = crypto.randomUUID();
    this.clients.set(clientId, { id: clientId, reply });
    return clientId;
  }

  /**
   * Remove an SSE client.
   *
   * @param clientId - The client ID returned from addClient
   */
  removeClient(clientId: string): void {
    this.clients.delete(clientId);
  }

  /**
   * Get the current watched project path.
   */
  getCurrentProjectPath(): string | null {
    return this.currentProjectPath;
  }

  /**
   * Get the number of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Notify all connected clients about changes.
   */
  private notifyClients(): void {
    const message = 'event: issues-changed\ndata: {}\n\n';

    for (const [clientId, client] of this.clients) {
      try {
        client.reply.raw.write(message);
      } catch {
        // Client disconnected, remove it
        this.clients.delete(clientId);
      }
    }
  }
}
