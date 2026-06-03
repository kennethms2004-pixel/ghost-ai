"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "./project-dialogs-provider";

export function EditorHome() {
  const { openCreate } = useProjectDialogsContext();

  return (
    <main className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
      </div>

      <Button className="gap-2 bg-brand text-base hover:opacity-90" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </main>
  );
}
