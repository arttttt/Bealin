import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Project } from '../entities/AppConfig.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

export class InvalidPathError extends Error {
  readonly code = 'INVALID_PATH';
  constructor() {
    super('Path does not exist or is not a valid beads directory');
  }
}

export class ProjectAlreadyExistsError extends Error {
  readonly code = 'ALREADY_EXISTS';
  constructor() {
    super('Project with this path already exists');
  }
}

@injectable()
export class AddProjectUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Add a new project.
   * @param projectPath - Absolute path to the project folder (NOT .beads folder)
   * @param name - Optional display name
   * @returns The created project
   * @throws InvalidPathError if path doesn't contain valid beads project
   * @throws ProjectAlreadyExistsError if project already exists
   */
  async execute(projectPath: string, name?: string): Promise<Project> {
    try {
      return await this.configService.addProject(projectPath, name);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          throw new InvalidPathError();
        }
        if (error.message.includes('already exists')) {
          throw new ProjectAlreadyExistsError();
        }
      }
      throw error;
    }
  }
}
