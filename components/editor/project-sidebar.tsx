"use client";

import { X, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectListItem } from "./project-list-item";
import { useProjectDialogsContext } from "./project-dialogs-provider";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No {label.toLowerCase()} yet</p>
    </div>
  );
}

function ProjectList({
  projects,
  emptyLabel,
  onNavigate,
}: {
  projects: Project[];
  emptyLabel: string;
  onNavigate: () => void;
}) {
  if (projects.length === 0) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className="flex flex-col gap-0.5 px-2 py-2">
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
}: ProjectSidebarProps) {
  const { openCreate } = useProjectDialogsContext();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:bg-transparent"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-12 left-0 bottom-0 z-50 w-72 flex flex-col bg-surface border-r border-surface-border transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Projects sidebar"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? undefined : -1}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border">
          <span className="text-sm font-medium text-copy-primary">Projects</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-copy-muted hover:text-copy-primary"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex flex-col flex-1 min-h-0">
          <TabsList className="mx-4 mt-3 mb-0 grid grid-cols-2">
            <TabsTrigger value="my-projects" className="text-xs">My Projects</TabsTrigger>
            <TabsTrigger value="shared" className="text-xs">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <ProjectList
                projects={ownedProjects}
                emptyLabel="projects"
                onNavigate={onClose}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <ProjectList
                projects={sharedProjects}
                emptyLabel="shared projects"
                onNavigate={onClose}
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-surface-border">
          <Button
            className="w-full gap-2 bg-brand text-base hover:opacity-90"
            size="sm"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
