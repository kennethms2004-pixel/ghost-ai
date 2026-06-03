"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Project } from "@/types/project";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  isSubmitting,
  error,
  onSubmit,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            Delete{" "}
            <span className="text-copy-secondary">{project?.name}</span>? This
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-error">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting…" : "Delete project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
