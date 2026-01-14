import type { Issue, IssueId } from '@bealin/shared';

/**
 * Repository interface for Issue aggregate.
 * Implementations: FileSystemIssueRepository (data layer)
 */
export interface IssueRepository {
  /**
   * Find all issues.
   * @returns Promise resolving to array of issues (empty if none)
   */
  findAll(): Promise<Issue[]>;

  /**
   * Find issue by ID.
   * @param id - Issue ID to search for
   * @returns Promise resolving to issue or null if not found
   */
  findById(id: IssueId): Promise<Issue | null>;
}
