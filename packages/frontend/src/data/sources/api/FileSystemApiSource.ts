import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { z } from 'zod';

/**
 * Response for POST /api/fs/pick-folder
 */
export interface PickFolderResponse {
  path: string | null;
  cancelled: boolean;
}

const pickFolderResponseSchema = z.object({
  path: z.string().nullable(),
  cancelled: z.boolean(),
});

const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

/**
 * API data source for file system operations.
 * Handles native file dialog invocations via backend.
 */
@injectable()
export class FileSystemApiSource {
  private readonly baseUrl = '/api/fs';

  /**
   * Show a native folder picker dialog.
   * @returns Promise resolving to selected path or null if cancelled
   * @throws Error if dialog fails to open
   */
  async pickFolder(): Promise<PickFolderResponse> {
    const response = await fetch(`${this.baseUrl}/pick-folder`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData: unknown = await response.json();
      const errorResult = errorResponseSchema.safeParse(errorData);

      if (errorResult.success) {
        throw new Error(errorResult.data.message);
      }

      throw new Error(`Failed to open folder picker: ${response.status}`);
    }

    const data: unknown = await response.json();
    const result = pickFolderResponseSchema.safeParse(data);

    if (!result.success) {
      throw new Error(`Invalid response format: ${result.error.message}`);
    }

    return result.data;
  }
}
