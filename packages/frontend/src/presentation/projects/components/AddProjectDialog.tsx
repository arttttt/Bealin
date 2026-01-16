import { useState } from 'react';
import { Loader2, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@presentation/shared/components/ui/dialog';
import { Button } from '@presentation/shared/components/ui/button';
import { Input } from '@presentation/shared/components/ui/input';
import { Label } from '@presentation/shared/components/ui/label';
import { cn } from '@presentation/shared/lib/utils';
import { useAddProjectViewModel } from '../viewmodels/useAddProjectViewModel';
import { useProjectsViewModel } from '../viewmodels/useProjectsViewModel';
import type { Project } from '@domain/entities/Project';

interface AddProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded?: (project: Project) => void;
}

/**
 * Dialog for adding a new beads project.
 * User enters a path to a folder containing .beads directory.
 */
export function AddProjectDialog({ isOpen, onClose, onProjectAdded }: AddProjectDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addProject } = useProjectsViewModel();
  const {
    path,
    setPath,
    name,
    setName,
    isValidating,
    validationResult,
    error,
    setError,
    isReady,
    reset,
  } = useAddProjectViewModel();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isReady) return;

    setIsAdding(true);
    try {
      const projectName = name.trim() || validationResult?.suggestedName || undefined;
      const project = await addProject(path.trim(), projectName);
      onProjectAdded?.(project);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isReady && !isAdding) {
      void handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Select a folder containing .beads directory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2" onKeyDown={handleKeyDown}>
          {/* Path Input */}
          <div className="space-y-2">
            <Label htmlFor="path">Project path</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="path"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/path/to/project"
                  className={cn(
                    'pr-8',
                    error && 'border-destructive',
                    validationResult?.valid && path.trim() && 'border-green-600',
                  )}
                  autoFocus
                />
                {/* Status indicator */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isValidating && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {!isValidating && validationResult?.valid && path.trim() && (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  {!isValidating && error && (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  // File System Access API is not widely supported and doesn't provide full paths
                  // For now, show a helpful message
                  alert('Paste the full path to your project folder.\n\nThe folder should contain a .beads directory.');
                }}
                title="Browse for folder"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Project name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={validationResult?.suggestedName || 'Auto-detected from path'}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the folder name
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isReady || isAdding}>
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Project'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
