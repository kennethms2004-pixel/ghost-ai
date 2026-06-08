import { currentUser } from '@clerk/nextjs/server'
import { getCurrentUserContext } from '@/lib/auth'
import { cursorColorForUser, getLiveblocks } from '@/lib/liveblocks'
import { findAccessibleProject } from '@/lib/projects'

/**
 * POST /api/liveblocks-auth — issue a Liveblocks session token for a project room.
 *
 * The Liveblocks client posts `{ room }` here; the room id is the project id, so
 * authorization is the same membership check used everywhere else: the caller
 * must be the owner or an invited collaborator. The room is created on first
 * access (private — access flows only through these session tokens), and the
 * returned token carries the user's display name, avatar, and a deterministic
 * cursor color so other clients can render their presence.
 */
export async function POST(request: Request) {
  const { userId, email } = await getCurrentUserContext()
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const room = (body as { room?: unknown }).room
  if (typeof room !== 'string' || room.length === 0) {
    return new Response('`room` is required', { status: 400 })
  }

  // Room id === project id: only members may join the room.
  const project = await findAccessibleProject(room, userId, email)
  if (!project) {
    return new Response('Forbidden', { status: 403 })
  }

  const user = await currentUser()
  const name = displayName(user) ?? email ?? 'Anonymous'
  const avatar = user?.imageUrl ?? ''

  const liveblocks = getLiveblocks()

  // Create the room on first access; idempotent for later joins.
  await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] })

  const session = liveblocks.prepareSession(userId, {
    userInfo: { name, avatar, color: cursorColorForUser(userId) },
  })
  session.allow(room, session.FULL_ACCESS)

  const { status, body: authBody } = await session.authorize()
  return new Response(authBody, { status })
}

/** Best-effort display name from a Clerk user's profile fields. */
function displayName(
  user: {
    firstName: string | null
    lastName: string | null
    username: string | null
  } | null,
): string | null {
  if (!user) return null
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return full || user.username || null
}
