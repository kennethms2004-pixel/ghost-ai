"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import type { Project } from "@/types/project";

export type ProjectDialogKind = "create" | "rename" | "delete" | null;

export interface UseProjectActions {
  /** Which dialog is currently open, if any. */
  openDialog: ProjectDialogKind;
  /** The project a rename/delete dialog is acting on. */
  activeProject: Project | null;
  /** Controlled value of the name input (create/rename). */
  name: string;
  setName: (value: string) => void;
  /** Live preview of the room id the create flow will use. */
  roomId: string;
  /** True while a submit is in flight. */
  isSubmitting: boolean;
  /** Last submit error, surfaced in the open dialog. */
  error: string | null;
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
  close: () => void;
  submitCreate: () => Promise<void>;
  submitRename: () => Promise<void>;
  submitDelete: () => Promise<void>;
}

/** Short, URL-safe suffix that disambiguates room ids derived from the same name. */
function generateSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** Build a room id from a name and a stable suffix. */
function buildRoomId(name: string, suffix: string): string {
  return `${slugify(name) || "project"}-${suffix}`;
}

/**
 * Owns the create/rename/delete dialog lifecycle and the project mutations
 * behind them. The room id generated at create time becomes the project's
 * primary key, so the project id and Liveblocks room id stay the same value.
 */
export function useProjectActions(): UseProjectActions {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const activeWorkspaceId = params?.projectId ?? null;

  const [openDialog, setOpenDialog] = useState<ProjectDialogKind>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  // Suffix is fixed when the create dialog opens so the previewed room id is
  // exactly the id that gets created.
  const [suffix, setSuffix] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    if (isSubmitting) return;
    setOpenDialog(null);
    setActiveProject(null);
    setName("");
    setError(null);
  }, [isSubmitting]);

  const openCreate = useCallback(() => {
    setActiveProject(null);
    setName("");
    setSuffix(generateSuffix());
    setError(null);
    setOpenDialog("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setActiveProject(project);
    setName(project.name);
    setError(null);
    setOpenDialog("rename");
  }, []);

  const openDelete = useCallback((project: Project) => {
    setActiveProject(project);
    setName("");
    setError(null);
    setOpenDialog("delete");
  }, []);

  const submitCreate = useCallback(async () => {
    const finalName = name.trim() || "Untitled Project";
    const roomId = buildRoomId(finalName, suffix);

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, name: finalName }),
      });
      if (!res.ok) throw new Error("Could not create the project. Try again.");

      const { project } = (await res.json()) as { project: { id: string } };
      setOpenDialog(null);
      setName("");
      // Project id and room id are the same value; open that workspace.
      router.push(`/editor/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, suffix, router]);

  const submitRename = useCallback(async () => {
    if (!activeProject) return;
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${activeProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Could not rename the project. Try again.");

      setOpenDialog(null);
      setActiveProject(null);
      setName("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeProject, name, router]);

  const submitDelete = useCallback(async () => {
    if (!activeProject) return;
    const target = activeProject;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${target.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete the project. Try again.");

      setOpenDialog(null);
      setActiveProject(null);
      // Leaving a workspace that no longer exists would 404; send the user home.
      if (activeWorkspaceId === target.id) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }, [activeProject, activeWorkspaceId, router]);

  return {
    openDialog,
    activeProject,
    name,
    setName,
    roomId: buildRoomId(name, suffix),
    isSubmitting,
    error,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
  };
}
