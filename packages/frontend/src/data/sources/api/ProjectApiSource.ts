import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { z } from 'zod';
import { ProjectApiError } from '../../errors/ProjectApiError';

/**
 * DTO for project from API.
 */
export interface ProjectApiDto {
  id: string;
  name: string;
  path: string;
  addedAt: string;
}

/**
 * Response for GET /api/projects
 */
export interface ProjectsResponse {
  projects: ProjectApiDto[];
  activeProjectId: string | null;
}

/**
 * Response for GET /api/projects/active
 */
export interface ActiveProjectResponse {
  project: ProjectApiDto | null;
}

/**
 * Response for POST /api/projects
 */
export interface AddProjectResponse {
  project: ProjectApiDto;
}

/**
 * Response for POST /api/projects/validate-path
 */
export interface ValidatePathResponse {
  valid: boolean;
  suggestedName: string;
}

const projectApiDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  addedAt: z.string(),
});

const projectsResponseSchema = z.object({
  projects: z.array(projectApiDtoSchema),
  activeProjectId: z.string().nullable(),
});

const activeProjectResponseSchema = z.object({
  project: projectApiDtoSchema.nullable(),
});

const addProjectResponseSchema = z.object({
  project: projectApiDtoSchema,
});

const validatePathResponseSchema = z.object({
  valid: z.boolean(),
  suggestedName: z.string(),
});

const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

/**
 * API data source for Project entity.
 * Handles HTTP communication with backend.
 */
@injectable()
export class ProjectApiSource {
  private readonly baseUrl = '/api/projects';

  /**
   * Fetch all projects with activeProjectId.
   * @returns Promise resolving to projects response
   */
  async fetchProjects(): Promise<ProjectsResponse> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = projectsResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Fetch the currently active project.
   * @returns Promise resolving to active project response
   */
  async fetchActiveProject(): Promise<ActiveProjectResponse> {
    const response = await fetch(`${this.baseUrl}/active`);

    if (!response.ok) {
      throw new Error(`Failed to fetch active project: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = activeProjectResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Add a new project.
   * @param path - Path to the project's .beads folder
   * @param name - Optional display name
   * @returns Promise resolving to created project
   * @throws ProjectApiError if path is invalid or project already exists
   */
  async addProject(path: string, name?: string): Promise<AddProjectResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, name }),
    });

    if (!response.ok) {
      const errorData: unknown = await response.json();
      const errorResult = errorResponseSchema.safeParse(errorData);

      if (errorResult.success) {
        const code = errorResult.data.error;
        if (code === 'INVALID_PATH' || code === 'ALREADY_EXISTS') {
          throw new ProjectApiError(code, errorResult.data.message);
        }
      }

      throw new Error(`Failed to add project: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = addProjectResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Remove a project.
   * @param id - Project ID to remove
   */
  async removeProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to remove project: ${response.status}`);
    }
  }

  /**
   * Set a project as active.
   * @param id - Project ID to activate
   * @throws ProjectApiError if project not found
   */
  async setActiveProject(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      if (response.status === 404) {
        const errorData: unknown = await response.json();
        const errorResult = errorResponseSchema.safeParse(errorData);

        if (errorResult.success) {
          throw new ProjectApiError('NOT_FOUND', errorResult.data.message);
        }
      }

      throw new Error(`Failed to activate project: ${response.status}`);
    }
  }

  /**
   * Validate a path as a valid beads project.
   * @param path - Path to validate
   * @returns Promise resolving to validation result
   */
  async validatePath(path: string): Promise<ValidatePathResponse> {
    const response = await fetch(`${this.baseUrl}/validate-path`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });

    if (!response.ok) {
      throw new Error(`Failed to validate path: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = validatePathResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }
}
