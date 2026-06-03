"use client";

import { createContext, useContext } from "react";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import type { Project } from "@/types/project";
import { CreateProjectDialog } from "./dialogs/create-project-dialog";
import { RenameProjectDialog } from "./dialogs/rename-project-dialog";
import { DeleteProjectDialog } from "./dialogs/delete-project-dialog";

interface ProjectDialogsContextValue {
  openCreate: () => void;
  openRename: (project: Project) => void;
  openDelete: (project: Project) => void;
}

const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(
  null
);

/**
 * Single owner of the project dialog lifecycle. Wraps the editor so both the
 * sidebar and the editor home screen can open the same create/rename/delete
 * dialogs, and renders those dialogs once at the top of the tree.
 */
export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dialogs = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider
      value={{
        openCreate: dialogs.openCreate,
        openRename: dialogs.openRename,
        openDelete: dialogs.openDelete,
      }}
    >
      {children}

      <CreateProjectDialog
        open={dialogs.openDialog === "create"}
        onOpenChange={(open) => !open && dialogs.close()}
        name={dialogs.name}
        onNameChange={dialogs.setName}
        isSubmitting={dialogs.isSubmitting}
        onSubmit={dialogs.submitCreate}
      />
      <RenameProjectDialog
        open={dialogs.openDialog === "rename"}
        onOpenChange={(open) => !open && dialogs.close()}
        project={dialogs.activeProject}
        name={dialogs.name}
        onNameChange={dialogs.setName}
        isSubmitting={dialogs.isSubmitting}
        onSubmit={dialogs.submitRename}
      />
      <DeleteProjectDialog
        open={dialogs.openDialog === "delete"}
        onOpenChange={(open) => !open && dialogs.close()}
        project={dialogs.activeProject}
        isSubmitting={dialogs.isSubmitting}
        onSubmit={dialogs.submitDelete}
      />
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext(): ProjectDialogsContextValue {
  const context = useContext(ProjectDialogsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used within a ProjectDialogsProvider"
    );
  }
  return context;
}
