import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Project } from '../entities/AppConfig.js';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

@injectable()
export class GetActiveProjectUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<Project | null> {
    return this.configService.getActiveProject();
  }
}
