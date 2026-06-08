/**
 * A project collaborator as surfaced to the share dialog. Collaborators are
 * stored by email only (no local user table); name and avatar are enriched from
 * Clerk at read time and fall back to null when no Clerk user matches the email.
 */
export interface Collaborator {
  email: string;
  /** Display name from Clerk, or null when no Clerk user matches the email. */
  name: string | null;
  /** Avatar URL from Clerk, or null when no Clerk user matches the email. */
  imageUrl: string | null;
}
