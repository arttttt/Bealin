import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { ConfigService } from '../../infrastructure/config/ConfigService.js';
import { DI_TOKENS } from '../../infrastructure/shared/di/tokens.js';

export interface ValidatePathResult {
  valid: boolean;
  suggestedName: string;
}

@injectable()
export class ValidateProjectPathUseCase {
  constructor(
    @inject(DI_TOKENS.ConfigService)
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate a beads project path.
   * @param beadsPath - Absolute path to the .beads directory
   * @returns Validation result with suggested name
   */
  execute(beadsPath: string): ValidatePathResult {
    return this.configService.validatePath(beadsPath);
  }
}
