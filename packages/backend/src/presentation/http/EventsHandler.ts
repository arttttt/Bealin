import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { BeadsWatcher } from '../../infrastructure/watchers/BeadsWatcher.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';

/**
 * HTTP handler for Server-Sent Events (SSE).
 * Provides real-time notifications when beads data changes.
 */
@injectable()
export class EventsHandler {
  private readonly watcher: BeadsWatcher;

  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.watcher = BeadsWatcher.getInstance();
  }

  registerRoutes(server: FastifyInstance): void {
    server.get('/api/events', this.streamEvents.bind(this));
  }

  /**
   * GET /api/events
   * SSE endpoint for real-time change notifications.
   *
   * Events:
   * - issues-changed: Fired when any .jsonl file changes in the watched project
   */
  private async streamEvents(
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    // Set SSE headers
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    // Ensure watcher is watching current active project
    const activeProject = await this.configService.getActiveProject();
    if (activeProject) {
      const currentWatchedPath = this.watcher.getCurrentProjectPath();
      if (currentWatchedPath !== activeProject.path) {
        await this.watcher.watchProject(activeProject.path);
      }
    }

    // Register client
    const clientId = this.watcher.addClient(reply);

    // Send initial connection event
    reply.raw.write('event: connected\ndata: {}\n\n');

    // Keep connection alive with periodic heartbeat
    const heartbeatInterval = setInterval(() => {
      try {
        reply.raw.write(':heartbeat\n\n');
      } catch {
        clearInterval(heartbeatInterval);
      }
    }, 30000); // 30 second heartbeat

    // Cleanup on close
    _request.raw.on('close', () => {
      clearInterval(heartbeatInterval);
      this.watcher.removeClient(clientId);
    });
  }
}
