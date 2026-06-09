"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { shallow } from "@liveblocks/react";
import { useOthersMapped } from "@liveblocks/react/suspense";

/** Max collaborator avatars shown before collapsing the rest into a +N chip. */
const MAX_AVATARS = 5;

/** Avatar diameter in pixels (kept in sync with the `h-7 w-7` Tailwind class). */
const AVATAR_PX = 28;

/** Shared sizing for the overlapping collaborator avatars. */
const AVATAR_SIZE = "h-7 w-7";

interface Collaborator {
  /** Clerk user id (carried on the Liveblocks session as `UserMeta.id`). */
  id: string;
  name: string;
  avatar: string;
  color: string;
}

/**
 * Collaborator presence group for the editor canvas view. Renders in the
 * top-right corner of the canvas, visually separate from the navbar. The current
 * user's account control (Clerk `UserButton`) lives in the navbar panel, so this
 * group shows *only* other collaborators.
 *
 * Collaborators come from Liveblocks presence. Entries whose Liveblocks user id
 * matches the current Clerk user id are filtered out — this also drops the
 * current user's other open tabs — and the remaining collaborators are
 * de-duplicated by id so each person appears once. When no one else is in the
 * room the group renders nothing.
 */
export function PresenceAvatars() {
  const { userId } = useAuth();

  // Map only identity fields per connection (not the cursor) so the avatar group
  // doesn't re-render every time someone moves their pointer. `shallow` keeps the
  // mapped value stable until one of these fields actually changes.
  const others = useOthersMapped(
    (other) => ({
      id: other.id,
      name: other.info?.name ?? "",
      avatar: other.info?.avatar ?? "",
      color: other.info?.color ?? "#808090",
    }),
    shallow,
  );

  const collaborators = useMemo<Collaborator[]>(() => {
    const seen = new Set<string>();
    const list: Collaborator[] = [];
    for (const [, info] of others) {
      // Skip connections without identity, the current user (incl. their other
      // tabs), and anyone already counted.
      if (!info.id || info.id === userId || seen.has(info.id)) continue;
      seen.add(info.id);
      list.push({ id: info.id, name: info.name, avatar: info.avatar, color: info.color });
    }
    return list;
  }, [others, userId]);

  // No other collaborators in the room → nothing to show. The current user's
  // account button lives in the navbar, so this group has nothing to render.
  if (collaborators.length === 0) return null;

  const visible = collaborators.slice(0, MAX_AVATARS);
  const overflow = collaborators.length - visible.length;

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center -space-x-2">
      {visible.map((collaborator) => (
        <CollaboratorAvatar key={collaborator.id} collaborator={collaborator} />
      ))}
      {overflow > 0 && (
        <div
          className={`${AVATAR_SIZE} flex items-center justify-center rounded-full bg-elevated text-[11px] font-medium text-copy-secondary ring-2 ring-base`}
          aria-label={`${overflow} more ${overflow === 1 ? "collaborator" : "collaborators"}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

/**
 * Display-only collaborator avatar — profile photo when available, otherwise the
 * first initial of their name on their presence color. A subtle ring keeps it
 * readable against the dark canvas.
 */
function CollaboratorAvatar({ collaborator }: { collaborator: Collaborator }) {
  const initial = collaborator.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      className={`${AVATAR_SIZE} overflow-hidden rounded-full ring-2 ring-base`}
      title={collaborator.name || undefined}
      aria-label={collaborator.name || "Collaborator"}
    >
      {collaborator.avatar ? (
        <Image
          src={collaborator.avatar}
          alt=""
          width={AVATAR_PX}
          height={AVATAR_PX}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[11px] font-semibold"
          style={{ backgroundColor: collaborator.color, color: "#0b0b0d" }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}
