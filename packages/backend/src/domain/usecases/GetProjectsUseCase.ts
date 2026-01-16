import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Project } from '../entities/AppConfig.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

export interface GetProjectsResult {
  projects: Project[];
  activeProjectId: string | null;
}

@injectable()
export class GetProjectsUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<GetProjectsResult> {
    const projects = await this.configService.getProjects();
    const activeProject = await this.configService.getActiveProject();
    return {
      projects,
      activeProjectId: activeProject?.id ?? null,
    };
  }
}
