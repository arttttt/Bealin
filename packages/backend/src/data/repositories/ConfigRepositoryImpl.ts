import { injectable } from 'tsyringe';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import type { AppConfig } from '../../domain/entities/AppConfig.js';
import type { ConfigRepository } from '../../domain/repositories/ConfigRepository.js';

/**
 * File-based implementation of ConfigRepository.
 * Stores configuration in ~/.bealin/config.json
 */
@injectable()
export class ConfigRepositoryImpl implements ConfigRepository {
  private readonly configDir = join(homedir(), '.bealin');
  private readonly configPath = join(this.configDir, 'config.json');

  async getConfig(): Promise<AppConfig> {
    if (!existsSync(this.configPath)) {
      return { projects: [], activeProjectId: null };
    }
    const content = await readFile(this.configPath, 'utf-8');
    return JSON.parse(content) as AppConfig;
  }

  async saveConfig(config: AppConfig): Promise<void> {
    if (!existsSync(this.configDir)) {
      await mkdir(this.configDir, { recursive: true });
    }
    await writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  getConfigPath(): string {
    return this.configPath;
  }
}
