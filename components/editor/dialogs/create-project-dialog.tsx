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
import { Input } from "@/components/ui/input";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  roomId: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  roomId,
  isSubmitting,
  error,
  onSubmit,
}: CreateProjectDialogProps) {
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Name your project. You can change it later.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-project-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit) return;
            onSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <Input
            autoFocus
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Checkout Service"
            aria-label="Project name"
          />
          <p className="text-xs text-copy-muted">
            Room ID:{" "}
            <span className="font-mono text-copy-secondary">{roomId}</span>
          </p>
          {error && <p className="text-sm text-error">{error}</p>}
        </form>

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
            type="submit"
            form="create-project-form"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Creating…" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
