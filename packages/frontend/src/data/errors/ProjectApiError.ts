export type ProjectApiErrorCode = 'INVALID_PATH' | 'ALREADY_EXISTS' | 'NOT_FOUND';

/**
 * Error thrown by Project API operations.
 */
export class ProjectApiError extends Error {
  constructor(
    public readonly code: ProjectApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ProjectApiError';
  }
}
