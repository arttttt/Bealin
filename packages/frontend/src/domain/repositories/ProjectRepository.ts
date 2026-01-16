import type { Project } from '../entities/Project';

/**
 * Repository interface for Project aggregate.
 * Implementations: ProjectRepositoryImpl (data layer)
 */
export interface ProjectRepository {
  /**
   * Get all projects with isActive computed.
   * @returns Promise resolving to array of projects
   */
  getProjects(): Promise<Project[]>;

  /**
   * Get the currently active project.
   * @returns Promise resolving to active project or null if none
   */
  getActiveProject(): Promise<Project | null>;

  /**
   * Add a new project.
   * @param path - Path to the project's .beads folder
   * @param name - Optional display name
   * @returns Promise resolving to the created project
   */
  addProject(path: string, name?: string): Promise<Project>;

  /**
   * Remove a project from the list.
   * @param id - Project ID to remove
   */
  removeProject(id: string): Promise<void>;

  /**
   * Set a project as the active project.
   * @param id - Project ID to activate
   */
  setActiveProject(id: string): Promise<void>;

  /**
   * Validate a path as a valid beads project.
   * @param path - Path to validate
   * @returns Promise resolving to validation result
   */
  validatePath(path: string): Promise<{ valid: boolean; suggestedName: string }>;
}
