import type { AppConfig } from '../entities/AppConfig.js';

/**
 * Repository interface for application configuration.
 * Implementations: ConfigRepositoryImpl (file-based)
 */
export interface ConfigRepository {
  /**
   * Get the current application configuration.
   * @returns Promise resolving to config (default config if file doesn't exist)
   */
  getConfig(): Promise<AppConfig>;

  /**
   * Save the application configuration.
   * @param config - The configuration to save
   */
  saveConfig(config: AppConfig): Promise<void>;

  /**
   * Get the path to the config file.
   * @returns Absolute path to config.json
   */
  getConfigPath(): string;
}
