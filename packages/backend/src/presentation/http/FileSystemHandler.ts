import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';
import type { BrowseFolderUseCase } from '../../domain/usecases/BrowseFolderUseCase.js';

interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * HTTP handler for file system operations.
 */
@injectable()
export class FileSystemHandler {
  constructor(
    @inject(DI_TOKENS.BrowseFolderUseCase)
    private readonly browseFolderUseCase: BrowseFolderUseCase,
  ) {}

  registerRoutes(server: FastifyInstance): void {
    server.post('/api/fs/pick-folder', this.pickFolder.bind(this));
  }

  /**
   * POST /api/fs/pick-folder
   * Show a native folder picker dialog and return the selected path.
   */
  private async pickFolder(
    _request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    try {
      const result = await this.browseFolderUseCase.execute();

      if (result.error) {
        const errorResponse: ErrorResponse = {
          error: 'DIALOG_ERROR',
          message: result.error,
        };
        reply.status(500).send(errorResponse);
        return;
      }

      reply.send({
        path: result.path,
        cancelled: result.cancelled,
      });
    } catch (error) {
      const errorResponse: ErrorResponse = {
        error: 'INTERNAL_ERROR',
        message: 'Failed to show folder picker',
      };
      reply.status(500).send(errorResponse);
    }
  }
}
