"use client";

import Link from "next/link";
import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjectDialogsContext } from "./project-dialogs-provider";
import type { Project } from "@/types/project";

export function ProjectListItem({
  project,
  onNavigate,
}: {
  project: Project;
  onNavigate?: () => void;
}) {
  const { openRename, openDelete } = useProjectDialogsContext();

  return (
    <div className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-elevated">
      <Link
        href={`/editor/${project.id}`}
        onClick={onNavigate}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <FolderOpen className="h-4 w-4 shrink-0 text-copy-muted" />
        <span className="flex-1 truncate text-sm text-copy-secondary">
          {project.name}
        </span>
      </Link>

      {project.isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-copy-muted opacity-0 group-hover:opacity-100 aria-expanded:opacity-100 hover:text-copy-primary"
                aria-label={`Actions for ${project.name}`}
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openRename(project)}>
              <Pencil />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => openDelete(project)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
