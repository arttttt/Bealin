/**
 * Error thrown when an operation requires an active project but none is selected.
 */
export class NoActiveProjectError extends Error {
  constructor(message: string = 'No active project selected') {
    super(message);
    this.name = 'NoActiveProjectError';
  }
}
