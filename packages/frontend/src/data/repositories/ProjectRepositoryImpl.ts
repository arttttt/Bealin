import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Project } from '@domain/entities/Project';
import type { ProjectRepository } from '@domain/repositories/ProjectRepository';
import { ProjectApiSource } from '../sources/api/ProjectApiSource';
import { ProjectMapper } from './ProjectMapper';

/**
 * Repository implementation for Project aggregate.
 * Uses API source for data fetching.
 */
@injectable()
export class ProjectRepositoryImpl implements ProjectRepository {
  constructor(
    @inject(ProjectApiSource)
    private readonly apiSource: ProjectApiSource,
  ) {}

  /**
   * Get all projects with isActive computed.
   * @returns Promise resolving to array of projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await this.apiSource.fetchProjects();
    return ProjectMapper.toDomainList(response.projects, response.activeProjectId);
  }

  /**
   * Get the currently active project.
   * @returns Promise resolving to active project or null if none
   */
  async getActiveProject(): Promise<Project | null> {
    const response = await this.apiSource.fetchActiveProject();

    if (!response.project) {
      return null;
    }

    return ProjectMapper.toDomain(response.project, true);
  }

  /**
   * Add a new project.
   * @param path - Path to the project's .beads folder
   * @param name - Optional display name
   * @returns Promise resolving to the created project
   */
  async addProject(path: string, name?: string): Promise<Project> {
    const response = await this.apiSource.addProject(path, name);
    // New project is active after adding
    return ProjectMapper.toDomain(response.project, true);
  }

  /**
   * Remove a project from the list.
   * @param id - Project ID to remove
   */
  async removeProject(id: string): Promise<void> {
    await this.apiSource.removeProject(id);
  }

  /**
   * Set a project as the active project.
   * @param id - Project ID to activate
   */
  async setActiveProject(id: string): Promise<void> {
    await this.apiSource.setActiveProject(id);
  }

  /**
   * Validate a path as a valid beads project.
   * @param path - Path to validate
   * @returns Promise resolving to validation result
   */
  async validatePath(path: string): Promise<{ valid: boolean; suggestedName: string }> {
    return this.apiSource.validatePath(path);
  }
}
