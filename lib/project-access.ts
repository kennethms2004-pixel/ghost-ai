import 'server-only'
import { getCurrentUserContext } from '@/lib/auth'
import { findAccessibleProject } from '@/lib/projects'

/**
 * Workspace access resolution for the editor route. Composes the identity
 * primitive (`getCurrentUserContext`, owner id + collaborator email) with the
 * ownership/collaborator check (`findAccessibleProject`) into a single
 * discriminated result the server component can switch on without re-deriving
 * auth state. Those primitives stay in `lib/auth.ts` / `lib/projects.ts` — this
 * module only orchestrates them for the access gate.
 */

type AccessibleProject = NonNullable<
  Awaited<ReturnType<typeof findAccessibleProject>>
>

export type ProjectAccess =
  | { status: 'unauthenticated' }
  | { status: 'denied' }
  | { status: 'granted'; project: AccessibleProject }

/**
 * Resolve whether the current user may open a project workspace.
 * - `unauthenticated`: no signed-in user (page should redirect to sign-in).
 * - `denied`: project is missing or the user is neither owner nor collaborator
 *   (the two collapse so a missing project never leaks its existence).
 * - `granted`: returns the project record for rendering.
 */
export async function resolveProjectAccess(
  projectId: string,
): Promise<ProjectAccess> {
  const { userId, email } = await getCurrentUserContext()
  if (!userId) return { status: 'unauthenticated' }

  const project = await findAccessibleProject(projectId, userId, email)
  if (!project) return { status: 'denied' }

  return { status: 'granted', project }
}
