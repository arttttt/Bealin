import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

export class ProjectNotFoundError extends Error {
  readonly code = 'NOT_FOUND';
  constructor(projectId: string) {
    super(`Project with ID '${projectId}' not found`);
  }
}

@injectable()
export class SetActiveProjectUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Set the active project.
   * @param projectId - The project ID to activate
   * @throws ProjectNotFoundError if project doesn't exist
   */
  async execute(projectId: string): Promise<void> {
    try {
      await this.configService.setActiveProject(projectId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new ProjectNotFoundError(projectId);
      }
      throw error;
    }
  }
}
