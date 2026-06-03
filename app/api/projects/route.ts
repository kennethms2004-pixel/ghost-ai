import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createProjectForOwner, listProjectsForOwner } from '@/lib/projects'

/** GET /api/projects — list the authenticated user's projects. */
export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const projects = await listProjectsForOwner(userId)
  return NextResponse.json({ projects })
}

/** POST /api/projects — create a project owned by the authenticated user. */
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await parseJsonBody(request)
  if (body === null) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (body.id !== undefined && (typeof body.id !== 'string' || body.id.trim().length === 0)) {
    return NextResponse.json({ error: '`id` must be a non-empty string' }, { status: 400 })
  }
  if (body.name !== undefined && typeof body.name !== 'string') {
    return NextResponse.json({ error: '`name` must be a string' }, { status: 400 })
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    return NextResponse.json({ error: '`description` must be a string' }, { status: 400 })
  }

  try {
    const project = await createProjectForOwner(userId, {
      id: body.id,
      name: body.name,
      description: body.description,
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    // A duplicate explicit id (room id collision) violates the primary key.
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: 'Project id already exists' }, { status: 409 })
    }
    throw error
  }
}

interface ProjectBody {
  id?: unknown
  name?: unknown
  description?: unknown
}

/** True for a Prisma unique-constraint violation (P2002). */
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  )
}

/** Parse a JSON request body, returning null when the body is absent or invalid. */
async function parseJsonBody(request: Request): Promise<ProjectBody | null> {
  try {
    const parsed = await request.json()
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed as ProjectBody
  } catch {
    return null
  }
}
