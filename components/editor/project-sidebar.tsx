"use client";

import { X, Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No {label.toLowerCase()} yet</p>
    </div>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-12 left-0 bottom-0 z-50 w-72 flex flex-col bg-surface border-r border-surface-border transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Projects sidebar"
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
              <EmptyState label="projects" />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <EmptyState label="shared projects" />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="p-4 border-t border-surface-border">
          <Button className="w-full gap-2 bg-brand text-base hover:opacity-90" size="sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
