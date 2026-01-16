import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { FileDialogSource, FileDialogResult } from '@data/sources/dialog/FileDialogSource.js';
import { DI_TOKENS } from '@infrastructure/shared/di/tokens.js';

/**
 * Use case for showing a folder picker dialog.
 */
@injectable()
export class BrowseFolderUseCase {
  constructor(
    @inject(DI_TOKENS.FileDialogSource)
    private readonly fileDialogSource: FileDialogSource,
  ) {}

  /**
   * Show a native folder picker dialog.
   * @returns The selected folder path or null if cancelled/error
   */
  async execute(): Promise<FileDialogResult> {
    return this.fileDialogSource.showFolderPicker();
  }
}
