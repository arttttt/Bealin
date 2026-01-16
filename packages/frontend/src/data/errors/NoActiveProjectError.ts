/**
 * Error thrown when the backend returns NO_ACTIVE_PROJECT.
 * This indicates no project is currently active, typically on first launch.
 */
export class NoActiveProjectError extends Error {
  constructor(message = 'No active project') {
    super(message);
    this.name = 'NoActiveProjectError';
  }
}
