import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import type { Collaborator } from '@/types/collaborator'

/**
 * Collaborators are stored by email only — there is no local user table. This
 * module enriches those emails with the display name and avatar from Clerk via
 * the Backend API. Emails with no matching Clerk user (e.g. invited before they
 * sign up) fall back to email-only, and a Clerk failure degrades the whole batch
 * to email-only rather than failing the request.
 */

/**
 * Clerk's `getUserList` caps `limit` (and the practical `emailAddress` filter
 * length) at 100 per request, so larger collaborator lists are looked up in
 * chunks instead of being silently truncated.
 */
const CLERK_LOOKUP_CHUNK_SIZE = 100

/** Build a best-effort display name from a Clerk user's profile fields. */
function displayName(user: {
  firstName: string | null
  lastName: string | null
  username: string | null
}): string | null {
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return full || user.username || null
}

/**
 * Map a list of collaborator emails to enriched `Collaborator` records, keeping
 * the input order. Always returns one entry per input email.
 */
export async function enrichCollaboratorEmails(
  emails: string[],
): Promise<Collaborator[]> {
  if (emails.length === 0) return []

  const byEmail = new Map<string, { name: string | null; imageUrl: string | null }>()

  try {
    const client = await clerkClient()

    // Look up emails in chunks: a single request only returns up to
    // `CLERK_LOOKUP_CHUNK_SIZE` users, so passing the full list would drop
    // matches for any collaborator beyond that cap.
    for (let i = 0; i < emails.length; i += CLERK_LOOKUP_CHUNK_SIZE) {
      const chunk = emails.slice(i, i + CLERK_LOOKUP_CHUNK_SIZE)
      const { data: users } = await client.users.getUserList({
        emailAddress: chunk,
        limit: chunk.length,
      })

      for (const user of users) {
        const enriched = { name: displayName(user), imageUrl: user.imageUrl ?? null }
        for (const address of user.emailAddresses) {
          byEmail.set(address.emailAddress.toLowerCase(), enriched)
        }
      }
    }
  } catch {
    // Degrade to email-only enrichment if the Backend API is unavailable.
  }

  return emails.map((email) => {
    const match = byEmail.get(email.toLowerCase())
    return {
      email,
      name: match?.name ?? null,
      imageUrl: match?.imageUrl ?? null,
    }
  })
}
