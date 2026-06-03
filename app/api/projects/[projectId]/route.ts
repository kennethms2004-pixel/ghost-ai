import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import {
  deleteProject,
  getProjectById,
  renameProject,
} from '@/lib/projects'

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
  const project = await getProjectById(projectId)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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

  const updated = await renameProject(projectId, name)
  return NextResponse.json({ project: updated })
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
  const project = await getProjectById(projectId)
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }
  if (project.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await deleteProject(projectId)
  return NextResponse.json({ success: true })
}
