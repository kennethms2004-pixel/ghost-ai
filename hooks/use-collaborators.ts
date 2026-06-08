"use client";

import { useCallback, useState } from "react";
import type { Collaborator } from "@/types/collaborator";

export interface UseCollaborators {
  collaborators: Collaborator[];
  /** Whether the current user owns the project (may invite/remove). */
  isOwner: boolean;
  /** True while the list is loading. */
  isLoading: boolean;
  /** True while an invite request is in flight. */
  isInviting: boolean;
  /** Last error from loading or a mutation, surfaced in the dialog. */
  error: string | null;
  /** Fetch the collaborator list — call when the dialog opens. */
  reload: () => Promise<void>;
  invite: (email: string) => Promise<boolean>;
  remove: (email: string) => Promise<void>;
}

/**
 * Loads and mutates a project's collaborator list for the share dialog. The
 * caller triggers `reload` when the dialog opens so the list is only requested
 * while it is visible. Server-side ownership checks remain authoritative;
 * `isOwner` only drives which controls render.
 */
export function useCollaborators(projectId: string): UseCollaborators {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error("Could not load collaborators.");
      const data = (await res.json()) as {
        collaborators: Collaborator[];
        isOwner: boolean;
      };
      setCollaborators(data.collaborators);
      setIsOwner(data.isOwner);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const invite = useCallback(
    async (email: string): Promise<boolean> => {
      setIsInviting(true);
      setError(null);
      try {
        const res = await fetch(`/api/projects/${projectId}/collaborators`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Could not invite that collaborator.");
        }
        // Reload so the new collaborator is enriched from Clerk consistently.
        await load();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        return false;
      } finally {
        setIsInviting(false);
      }
    },
    [projectId, load],
  );

  const remove = useCallback(
    async (email: string): Promise<void> => {
      setError(null);
      // Optimistically drop the row; restore on failure.
      const previous = collaborators;
      setCollaborators((current) => current.filter((c) => c.email !== email));
      try {
        const res = await fetch(
          `/api/projects/${projectId}/collaborators?email=${encodeURIComponent(email)}`,
          { method: "DELETE" },
        );
        if (!res.ok) throw new Error("Could not remove that collaborator.");
      } catch (err) {
        setCollaborators(previous);
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    },
    [projectId, collaborators],
  );

  return {
    collaborators,
    isOwner,
    isLoading,
    isInviting,
    error,
    reload: load,
    invite,
    remove,
  };
}
