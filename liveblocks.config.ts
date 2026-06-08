/**
 * Liveblocks global type augmentation. Defining `Presence` and `UserMeta` here
 * types every Liveblocks hook and the server-side `prepareSession` call across
 * the app — there is no runtime here, only the shared shape contract.
 *
 * - `Presence`: per-user ephemeral state broadcast to the room. The cursor is
 *   `null` until the pointer enters the canvas; `isThinking` flags a user whose
 *   AI request is in flight.
 * - `UserMeta`: immutable identity attached to a session at auth time. `id` is
 *   the Clerk user id; `info` carries what other clients render (name, avatar,
 *   and the deterministic cursor color from `cursorColorForUser`).
 */
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking: boolean
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }
  }
}

export {}
