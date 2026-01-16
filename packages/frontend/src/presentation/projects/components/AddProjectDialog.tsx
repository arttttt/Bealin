import { useState, useEffect } from 'react';
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
  /** When true, dialog cannot be closed without adding a project */
  preventClose?: boolean;
}

/**
 * Dialog for adding a new beads project.
 * User enters a path to a folder containing .beads directory.
 */
export function AddProjectDialog({ isOpen, onClose, onProjectAdded, preventClose }: AddProjectDialogProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addProject } = useProjectsViewModel();
  const {
    path,
    name,
    setName,
    isValidating,
    validationResult,
    error,
    setError,
    isReady,
    reset,
    browseFolder,
    isBrowsing,
  } = useAddProjectViewModel();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    if (preventClose) return;
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
    <Dialog open={isOpen} onOpenChange={(open: boolean) => {
      if (!open && preventClose) return;
      if (!open) handleClose();
    }}>
      <DialogContent
        className="sm:max-w-[480px]"
        showCloseButton={!preventClose}
        onEscapeKeyDown={(e) => (isBrowsing || preventClose) && e.preventDefault()}
        onPointerDownOutside={(e) => preventClose && e.preventDefault()}
      >
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
                  placeholder="/path/to/project"
                  className={cn(
                    'pr-8 pointer-events-none',
                    'focus:ring-0 focus:border-input focus-visible:ring-0 focus-visible:ring-offset-0',
                    error && 'border-destructive',
                    validationResult?.valid && path.trim() && 'border-green-600',
                  )}
                  readOnly
                  tabIndex={-1}
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
                onClick={() => void browseFolder()}
                disabled={isBrowsing}
                title="Browse for folder"
              >
                {isBrowsing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FolderOpen className="h-4 w-4" />
                )}
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
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use the folder name
            </p>
          </div>
        </div>

        <DialogFooter>
          {!preventClose && (
            <Button variant="ghost" onClick={handleClose} disabled={isAdding}>
              Cancel
            </Button>
          )}
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
