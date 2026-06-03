import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { deleteProject, renameProject } from '@/lib/projects'

/** True for a Prisma "record not found" error (P2025). */
function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2025'
  )
}

/** PATCH /api/projects/[projectId] — rename a project (owner only). */
export async function PATCH(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]'>,
) {
  const { userId } = await auth()
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

  const name = (body as { name?: unknown }).name
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: '`name` is required and must be a non-empty string' },
      { status: 400 },
    )
  }

  try {
    const updated = await renameProject(projectId, userId, name)
    return NextResponse.json({ project: updated })
  } catch (error) {
    // The owner-scoped update finds no row when the project is missing or not
    // owned by this user; both collapse to 404 to avoid leaking existence.
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    throw error
  }
}

/** DELETE /api/projects/[projectId] — delete a project (owner only). */
export async function DELETE(
  _request: Request,
  ctx: RouteContext<'/api/projects/[projectId]'>,
) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId } = await ctx.params

  try {
    await deleteProject(projectId, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (isNotFoundError(error)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    throw error
  }
}
