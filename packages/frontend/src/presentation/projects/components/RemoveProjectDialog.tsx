import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@presentation/shared/components/ui/dialog';
import { Button } from '@presentation/shared/components/ui/button';
import type { Project } from '@domain/entities/Project';

interface RemoveProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onConfirm: () => void;
  isActiveProject: boolean;
}

export function RemoveProjectDialog({
  isOpen,
  onClose,
  project,
  onConfirm,
  isActiveProject,
}: RemoveProjectDialogProps) {
  if (!project) return null;

  if (isActiveProject) {
    return (
      <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cannot remove active project</DialogTitle>
            <DialogDescription>
              Please switch to another project first before removing this one.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Remove project?</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <p className="text-sm font-medium text-foreground">"{project.name}"</p>
          <p className="text-sm text-muted-foreground break-all">{project.path}</p>
          <p className="text-sm text-muted-foreground pt-2">
            This will only remove the project from the list. Files on disk will not be deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
