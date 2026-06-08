import { NextResponse } from 'next/server'
import { getCurrentUserContext } from '@/lib/auth'
import { enrichCollaboratorEmails } from '@/lib/collaborators'
import {
  addProjectCollaborator,
  findAccessibleProject,
  listProjectCollaborators,
  removeProjectCollaborator,
} from '@/lib/projects'

/** Permissive email shape check — the real source of truth is Clerk enrichment. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** True for a Prisma "record not found" error (P2025). */
function isNotFoundError(error: unknown): boolean {
  return hasPrismaCode(error, 'P2025')
}

/** True for a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return hasPrismaCode(error, 'P2002')
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  )
}

/**
 * GET /api/projects/[projectId]/collaborators — list collaborators.
 * Any project member (owner or collaborator) may read the list; the response
 * includes `isOwner` so the client knows whether to render management controls.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/collaborators'>,
) {
  const { userId, email } = await getCurrentUserContext()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params
  const project = await findAccessibleProject(projectId, userId, email)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const records = await listProjectCollaborators(projectId)
  const collaborators = await enrichCollaboratorEmails(records.map((r) => r.email))

  return NextResponse.json({
    collaborators,
    isOwner: project.ownerId === userId,
  })
}

/**
 * POST /api/projects/[projectId]/collaborators — invite a collaborator by email.
 * Owner only; ownership is enforced atomically by the owner-scoped write.
 */
export async function POST(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/collaborators'>,
) {
  const { userId, email: ownerEmail } = await getCurrentUserContext()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const raw = (body as { email?: unknown }).email
  if (typeof raw !== 'string' || !EMAIL_PATTERN.test(raw.trim())) {
    return NextResponse.json(
      { error: '`email` is required and must be a valid email address' },
      { status: 400 },
    )
  }

  const normalized = raw.trim().toLowerCase()
  if (normalized === ownerEmail) {
    return NextResponse.json(
      { error: 'You already own this project' },
      { status: 400 },
    )
  }

  try {
    await addProjectCollaborator(projectId, userId, normalized)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: 'That email is already a collaborator' },
        { status: 409 },
      )
    }
    throw error
  }
}

/**
 * DELETE /api/projects/[projectId]/collaborators?email=… — remove a collaborator.
 * Owner only; ownership is enforced atomically by the owner-scoped write.
 */
export async function DELETE(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/collaborators'>,
) {
  const { userId } = await getCurrentUserContext()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params
  const email = new URL(request.url).searchParams.get('email')
  if (!email || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json(
      { error: '`email` query parameter is required' },
      { status: 400 },
    )
  }

  try {
    await removeProjectCollaborator(projectId, userId, email)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    throw error
  }
}
