"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Copy, Loader2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCollaborators } from "@/hooks/use-collaborators";
import type { Collaborator } from "@/types/collaborator";
import type { Project } from "@/types/project";

/**
 * Share entry point for the editor navbar: a Share button that opens a dialog
 * for viewing and (for owners) managing project collaborators. Collaborators see
 * a read-only list; ownership of every mutation is enforced server-side, so the
 * owner-only controls here are a UX affordance, not the access boundary.
 */
export function ShareProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);
  const {
    collaborators,
    isOwner,
    isLoading,
    isInviting,
    error,
    reload,
    invite,
    remove,
  } = useCollaborators(project.id);

  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) reload();
  };

  const handleInvite = async () => {
    const trimmed = email.trim();
    if (!trimmed || isInviting) return;
    const ok = await invite(trimmed);
    if (ok) setEmail("");
  };

  const handleCopyLink = async () => {
    try {
      const link = `${window.location.origin}/editor/${project.id}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail silently.
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-copy-secondary hover:text-copy-primary"
          />
        }
      >
        <Share2 className="h-4 w-4" />
        Share
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share project</DialogTitle>
          <DialogDescription>
            {isOwner
              ? "Invite collaborators by email to give them access."
              : "People with access to this project."}
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <div className="flex flex-col gap-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                handleInvite();
              }}
            >
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
                aria-label="Collaborator email"
                className="flex-1"
              />
              <Button type="submit" disabled={!email.trim() || isInviting}>
                {isInviting ? "Inviting…" : "Invite"}
              </Button>
            </form>

            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              className="justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy project link
                </>
              )}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium text-copy-muted">Collaborators</p>
          {isLoading ? (
            <div className="flex items-center gap-2 py-3 text-sm text-copy-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : collaborators.length === 0 ? (
            <p className="py-3 text-sm text-copy-muted">No collaborators yet.</p>
          ) : (
            <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <CollaboratorRow
                  key={collaborator.email}
                  collaborator={collaborator}
                  canRemove={isOwner}
                  onRemove={() => remove(collaborator.email)}
                />
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollaboratorRow({
  collaborator,
  canRemove,
  onRemove,
}: {
  collaborator: Collaborator;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const label = collaborator.name ?? collaborator.email;
  const initial = label.trim().charAt(0).toUpperCase() || "?";

  return (
    <li className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-elevated">
      {collaborator.imageUrl ? (
        <Image
          src={collaborator.imageUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-medium text-copy-secondary">
          {initial}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-copy-primary">{label}</span>
        {collaborator.name && (
          <span className="truncate text-xs text-copy-muted">
            {collaborator.email}
          </span>
        )}
      </div>

      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="text-copy-muted opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-error focus-visible:text-error"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </li>
  );
}
