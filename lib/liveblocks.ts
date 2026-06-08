import 'server-only'
import { Liveblocks } from '@liveblocks/node'

/**
 * Cached Liveblocks node client. The instance is created lazily on first use and
 * cached on `globalThis` so it's reused across requests and hot reloads (one
 * client, not one per request). Initialization is deferred — rather than eager
 * like the Prisma client — so importing this module never requires the secret;
 * it's only needed when a token is actually issued, keeping production builds
 * green before a `LIVEBLOCKS_SECRET_KEY` is provisioned. The secret never leaves
 * the server (`server-only`).
 */
function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new Error('Missing LIVEBLOCKS_SECRET_KEY environment variable')
  }
  return new Liveblocks({ secret })
}

const globalForLiveblocks = globalThis as unknown as {
  liveblocks?: Liveblocks
}

/** Resolve the cached Liveblocks node client, creating it on first use. */
export function getLiveblocks(): Liveblocks {
  const client = globalForLiveblocks.liveblocks ?? createLiveblocksClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForLiveblocks.liveblocks = client
  }
  return client
}

/**
 * Fixed cursor palette. Colors are picked deterministically so a given user
 * keeps the same cursor color across sessions and devices.
 */
const CURSOR_COLORS = [
  '#E57373', // red
  '#F06292', // pink
  '#BA68C8', // purple
  '#7986CB', // indigo
  '#64B5F6', // blue
  '#4DD0E1', // cyan
  '#4DB6AC', // teal
  '#81C784', // green
  '#FFB74D', // orange
  '#A1887F', // brown
] as const

/**
 * Map a user id to a stable cursor color. Uses a simple deterministic hash over
 * the id so the same user always resolves to the same palette entry, and the
 * color is consistent for every other client that sees them.
 */
export function cursorColorForUser(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}
