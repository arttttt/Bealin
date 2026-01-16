import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface FileDialogResult {
  path: string | null;
  cancelled: boolean;
  error?: string;
}

/**
 * Source for showing native file dialogs.
 * Uses platform-specific commands to display folder picker.
 */
@injectable()
export class FileDialogSource {
  /**
   * Show a native folder picker dialog.
   * @returns Selected folder path or null if cancelled
   */
  async showFolderPicker(): Promise<FileDialogResult> {
    const platform = process.platform;

    try {
      if (platform === 'darwin') {
        return await this.showMacOSDialog();
      } else if (platform === 'linux') {
        return await this.showLinuxDialog();
      } else if (platform === 'win32') {
        return await this.showWindowsDialog();
      } else {
        return {
          path: null,
          cancelled: false,
          error: `Unsupported platform: ${platform}`,
        };
      }
    } catch (error) {
      return {
        path: null,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async showMacOSDialog(): Promise<FileDialogResult> {
    const script = `
      set selectedFolder to choose folder with prompt "Select a folder containing .beads directory"
      return POSIX path of selectedFolder
    `;

    try {
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      const path = stdout.trim();
      // Remove trailing slash if present
      const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
      return {
        path: normalizedPath,
        cancelled: false,
      };
    } catch (error) {
      // User cancelled the dialog
      if (error instanceof Error && error.message.includes('User canceled')) {
        return {
          path: null,
          cancelled: true,
        };
      }
      throw error;
    }
  }

  private async showLinuxDialog(): Promise<FileDialogResult> {
    // Try zenity first (GTK), then kdialog (KDE)
    try {
      const { stdout } = await execAsync(
        'zenity --file-selection --directory --title="Select a folder containing .beads directory"',
      );
      return {
        path: stdout.trim(),
        cancelled: false,
      };
    } catch (zenityError) {
      // Check if zenity returned 1 (cancelled) vs other error
      if (
        zenityError instanceof Error &&
        'code' in zenityError &&
        zenityError.code === 1
      ) {
        return {
          path: null,
          cancelled: true,
        };
      }

      // Try kdialog
      try {
        const { stdout } = await execAsync(
          'kdialog --getexistingdirectory ~/ --title "Select a folder containing .beads directory"',
        );
        return {
          path: stdout.trim(),
          cancelled: false,
        };
      } catch (kdialogError) {
        if (
          kdialogError instanceof Error &&
          'code' in kdialogError &&
          kdialogError.code === 1
        ) {
          return {
            path: null,
            cancelled: true,
          };
        }
        throw new Error(
          'No file dialog available. Please install zenity or kdialog.',
        );
      }
    }
  }

  private async showWindowsDialog(): Promise<FileDialogResult> {
    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
      $dialog.Description = "Select a folder containing .beads directory"
      $dialog.ShowNewFolderButton = $false
      if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $dialog.SelectedPath
      }
    `;

    try {
      const { stdout } = await execAsync(
        `powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`,
      );
      const path = stdout.trim();
      if (!path) {
        return {
          path: null,
          cancelled: true,
        };
      }
      return {
        path,
        cancelled: false,
      };
    } catch (error) {
      throw error;
    }
  }
}
