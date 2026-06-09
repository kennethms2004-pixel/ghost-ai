"use client";

import { LayoutTemplate, PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { useAiSidebar } from "./ai-sidebar-context";
import { CanvasSaveStatus } from "./canvas-save-status";
import { useStarterTemplates } from "./starter-templates-context";
import { ShareProjectDialog } from "./dialogs/share-project-dialog";
import type { Project } from "@/types/project";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  /** The project currently open in the workspace, or null on the editor home. */
  activeProject: Project | null;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  activeProject,
}: EditorNavbarProps) {
  const { isOpen: isAiOpen, toggle: toggleAi } = useAiSidebar();
  const { open: openTemplates } = useStarterTemplates();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center gap-2 px-3 bg-surface border-b border-surface-border">
      <Button
        variant="ghost"
        size="icon"
        onClick={onSidebarToggle}
        className="h-8 w-8 shrink-0 text-copy-muted hover:text-copy-primary"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? (
          <PanelLeftClose className="h-4 w-4" />
        ) : (
          <PanelLeftOpen className="h-4 w-4" />
        )}
      </Button>

      {activeProject && (
        <span className="min-w-0 truncate text-sm font-medium text-copy-primary">
          {activeProject.name}
        </span>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        {activeProject && (
          <>
            <CanvasSaveStatus />
            <Button
              variant="ghost"
              size="sm"
              onClick={openTemplates}
              aria-label="Start from a template"
              className="gap-1.5 text-copy-secondary hover:text-copy-primary"
            >
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <ShareProjectDialog project={activeProject} />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAi}
              aria-pressed={isAiOpen}
              aria-label={isAiOpen ? "Hide AI assistant" : "Show AI assistant"}
              className={`h-8 w-8 ${
                isAiOpen
                  ? "text-ai-text"
                  : "text-copy-muted hover:text-copy-primary"
              }`}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </>
        )}
        {/* The account control (sign in/out, account settings) lives in the
            navbar panel in every view — the canvas presence group only shows
            collaborator avatars, never the current user's account button. */}
        <UserButton />
      </div>
    </header>
  );
}
