"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogsProvider } from "./project-dialogs-provider";
import { AiSidebarProvider } from "./ai-sidebar-context";
import type { Project } from "@/types/project";

interface EditorShellProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
}

export function EditorShell({
  children,
  ownedProjects,
  sharedProjects,
}: EditorShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The workspace route is `/editor/[projectId]`; on the editor home there is
  // no projectId. Resolve the open project from the already-fetched lists so
  // the navbar and sidebar share the current workspace context.
  const params = useParams();
  const activeProjectId =
    typeof params.projectId === "string" ? params.projectId : null;
  const activeProject = activeProjectId
    ? [...ownedProjects, ...sharedProjects].find(
        (project) => project.id === activeProjectId,
      ) ?? null
    : null;

  return (
    <AiSidebarProvider>
      <ProjectDialogsProvider>
        <EditorNavbar
          isSidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
          activeProject={activeProject}
        />
        <ProjectSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProjectId}
        />
        <div className="pt-12 min-h-screen bg-base">{children}</div>
      </ProjectDialogsProvider>
    </AiSidebarProvider>
  );
}
