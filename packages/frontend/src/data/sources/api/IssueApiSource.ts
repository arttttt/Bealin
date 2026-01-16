import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { type IssueDto, issueSchema } from '@bealin/shared';
import { z } from 'zod';
import { NoActiveProjectError } from '../../errors/NoActiveProjectError';

const issueListSchema = z.array(issueSchema);

const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

/**
 * API data source for Issue entity.
 * Handles HTTP communication with backend.
 */
@injectable()
export class IssueApiSource {
  private readonly baseUrl = '/api/issues';

  /**
   * Fetch all issues from API.
   * @returns Promise resolving to array of IssueDto
   * @throws Error if network fails or response invalid
   */
  async fetchAll(): Promise<IssueDto[]> {
    const response = await fetch(this.baseUrl);

    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => null);
      const errorResult = apiErrorSchema.safeParse(errorData);

      if (errorResult.success && errorResult.data.error.code === 'NO_ACTIVE_PROJECT') {
        throw new NoActiveProjectError(errorResult.data.error.message);
      }

      throw new Error(`Failed to fetch issues: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = issueListSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }

  /**
   * Fetch single issue by ID from API.
   * @param id - Issue ID string
   * @returns Promise resolving to IssueDto or null if not found
   * @throws Error if network fails or response invalid (except 404)
   */
  async fetchById(id: string): Promise<IssueDto | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData: unknown = await response.json().catch(() => null);
      const errorResult = apiErrorSchema.safeParse(errorData);

      if (errorResult.success && errorResult.data.error.code === 'NO_ACTIVE_PROJECT') {
        throw new NoActiveProjectError(errorResult.data.error.message);
      }

      throw new Error(`Failed to fetch issue: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = issueSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }
}
