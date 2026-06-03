"use client";

import { useState } from "react";
import { EditorNavbar } from "./editor-navbar";
import { ProjectSidebar } from "./project-sidebar";
import { ProjectDialogsProvider } from "./project-dialogs-provider";
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

  return (
    <ProjectDialogsProvider>
      <EditorNavbar
        isSidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <ProjectSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <div className="pt-12 min-h-screen bg-base">{children}</div>
    </ProjectDialogsProvider>
  );
}
