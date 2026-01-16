import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

@injectable()
export class RemoveProjectUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  async execute(projectId: string): Promise<void> {
    await this.configService.removeProject(projectId);
  }
}
