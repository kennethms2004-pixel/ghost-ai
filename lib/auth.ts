import 'server-only'
import { currentUser } from '@clerk/nextjs/server'

/**
 * The minimal identity a server component needs to resolve a user's projects:
 * their Clerk id (owner key) and primary email (collaborator key).
 */
export interface CurrentUserContext {
  userId: string | null
  email: string | null
}

/** Resolve the signed-in user's id and primary email, or nulls when signed out. */
export async function getCurrentUserContext(): Promise<CurrentUserContext> {
  const user = await currentUser()
  if (!user) return { userId: null, email: null }

  const primary =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId) ??
    user.emailAddresses[0]

  return { userId: user.id, email: primary?.emailAddress ?? null }
}
