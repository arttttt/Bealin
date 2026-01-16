import { inject, injectable } from 'tsyringe';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { Project } from '../../domain/entities/AppConfig.js';
import type { ConfigRepository } from '../../domain/repositories/ConfigRepository.js';
import { DI_TOKENS } from '../shared/di/tokens.js';

/**
 * Service for managing application configuration.
 * Provides high-level operations for project management.
 */
@injectable()
export class ConfigService {
  constructor(
    @inject(DI_TOKENS.ConfigRepository) private readonly configRepo: ConfigRepository,
  ) {}

  /**
   * Get all registered projects.
   */
  async getProjects(): Promise<Project[]> {
    const config = await this.configRepo.getConfig();
    return config.projects;
  }

  /**
   * Get the currently active project.
   * @returns Active project or null if none selected
   */
  async getActiveProject(): Promise<Project | null> {
    const config = await this.configRepo.getConfig();
    if (!config.activeProjectId) return null;
    return config.projects.find((p) => p.id === config.activeProjectId) ?? null;
  }

  /**
   * Get the .beads directory path for a project.
   * @param project - The project
   * @returns Absolute path to the .beads directory
   */
  getBeadsPath(project: Project): string {
    return join(project.path, '.beads');
  }

  /**
   * Get the issues.jsonl path for a project.
   * @param project - The project
   * @returns Absolute path to issues.jsonl
   */
  getIssuesPath(project: Project): string {
    return join(project.path, '.beads', 'issues.jsonl');
  }

  /**
   * Add a new project to the configuration.
   * @param projectPath - Absolute path to the project folder (NOT .beads folder)
   * @param name - Optional display name (extracted from path if not provided)
   * @returns The created project
   * @throws Error if path is invalid or project already exists
   */
  async addProject(projectPath: string, name?: string): Promise<Project> {
    const config = await this.configRepo.getConfig();

    // Validate: projectPath/.beads/issues.jsonl must exist
    const issuesPath = join(projectPath, '.beads', 'issues.jsonl');

    if (!existsSync(issuesPath)) {
      throw new Error('Invalid project: .beads/issues.jsonl not found');
    }

    // Check not already added
    if (config.projects.some((p) => p.path === projectPath)) {
      throw new Error('Project already exists');
    }

    const project: Project = {
      id: crypto.randomUUID(),
      name: name ?? this.extractNameFromPath(projectPath),
      path: projectPath,
      addedAt: new Date().toISOString(),
    };

    config.projects.push(project);
    if (!config.activeProjectId) {
      config.activeProjectId = project.id;
    }

    await this.configRepo.saveConfig(config);
    return project;
  }

  /**
   * Remove a project from the configuration.
   * @param projectId - The project ID to remove
   */
  async removeProject(projectId: string): Promise<void> {
    const config = await this.configRepo.getConfig();
    config.projects = config.projects.filter((p) => p.id !== projectId);
    if (config.activeProjectId === projectId) {
      config.activeProjectId = config.projects[0]?.id ?? null;
    }
    await this.configRepo.saveConfig(config);
  }

  /**
   * Set the active project.
   * @param projectId - The project ID to make active
   * @throws Error if project not found
   */
  async setActiveProject(projectId: string): Promise<void> {
    const config = await this.configRepo.getConfig();
    const project = config.projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    config.activeProjectId = projectId;
    await this.configRepo.saveConfig(config);
  }

  /**
   * Validate that a path is a valid beads project.
   * @param beadsPath - Absolute path to the .beads directory
   * @returns Object with validity and suggested name
   */
  validatePath(beadsPath: string): { valid: boolean; suggestedName: string } {
    const issuesPath = join(beadsPath, 'issues.jsonl');
    const valid = existsSync(issuesPath);

    // Extract suggested name from parent directory of .beads
    const projectPath = beadsPath.replace(/\/.beads\/?$/, '');
    const suggestedName = this.extractNameFromPath(projectPath);

    return { valid, suggestedName };
  }

  /**
   * Extract a display name from a project path.
   * @param projectPath - The project path
   * @returns The last path segment as the name
   */
  private extractNameFromPath(projectPath: string): string {
    const parts = projectPath.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? 'Unnamed';
  }
}
