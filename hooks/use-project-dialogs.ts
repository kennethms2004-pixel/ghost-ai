"use client";

import { useCallback, useState } from "react";
import type { Project } from "@/types/project";

export type ProjectDialogKind = "create" | "rename" | "delete" | null;

export interface UseProjectDialogs {
  /** Which dialog is currently open, if any. */
  openDialog: ProjectDialogKind;
  /** The project a rename/delete dialog is acting on. */
  activeProject: Project | null;
  /** Controlled value of the name input (create/rename). */
  name: string;
  setName: (value: string) => void;
  /** True while a submit is in flight. */
  isSubmitting: boolean;
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
  close: () => void;
  submitCreate: () => Promise<void>;
  submitRename: () => Promise<void>;
  submitDelete: () => Promise<void>;
}

/**
 * Owns the create/rename/delete dialog lifecycle for projects: which dialog is
 * open, the in-progress form value, and the submit loading flag. No persistence
 * yet — submit handlers simulate the async round-trip and then close.
 */
export function useProjectDialogs(): UseProjectDialogs {
  const [openDialog, setOpenDialog] = useState<ProjectDialogKind>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = useCallback(() => {
    if (isSubmitting) return;
    setOpenDialog(null);
    setActiveProject(null);
    setName("");
  }, [isSubmitting]);

  const openCreate = useCallback(() => {
    setActiveProject(null);
    setName("");
    setOpenDialog("create");
  }, []);

  const openRename = useCallback((project: Project) => {
    setActiveProject(project);
    setName(project.name);
    setOpenDialog("rename");
  }, []);

  const openDelete = useCallback((project: Project) => {
    setActiveProject(project);
    setName("");
    setOpenDialog("delete");
  }, []);

  const runSubmit = useCallback(async () => {
    setIsSubmitting(true);
    // Simulate the eventual persistence round-trip. Replaced by a real API
    // call in a later feature unit.
    await new Promise((resolve) => setTimeout(resolve, 350));
    setIsSubmitting(false);
    setOpenDialog(null);
    setActiveProject(null);
    setName("");
  }, []);

  return {
    openDialog,
    activeProject,
    name,
    setName,
    isSubmitting,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate: runSubmit,
    submitRename: runSubmit,
    submitDelete: runSubmit,
  };
}
