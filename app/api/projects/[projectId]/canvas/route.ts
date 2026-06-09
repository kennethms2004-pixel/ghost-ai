import { get, put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getCurrentUserContext } from '@/lib/auth'
import {
  findAccessibleProject,
  updateProjectCanvasJsonPath,
} from '@/lib/projects'

/**
 * Canvas persistence. Prisma owns only metadata (the saved blob URL on
 * `Project.canvasJsonPath`); the actual canvas JSON lives in Vercel Blob. Both
 * routes are open to any project member (owner or collaborator) since the canvas
 * is collaborative — access is gated by `findAccessibleProject`.
 *
 * The Blob store is configured for **private** access, so blobs are uploaded and
 * read with `access: 'private'` — their URLs require authentication, so the load
 * path fetches through the SDK's `get()` (which signs the request) rather than a
 * plain `fetch`.
 */

/** Stable per-project blob path so re-saves overwrite instead of accumulating. */
function canvasBlobPath(projectId: string): string {
  return `canvas/${projectId}.json`
}

/**
 * PUT /api/projects/[projectId]/canvas — save the latest canvas JSON.
 * Uploads the JSON body to Vercel Blob and stores the returned URL on the
 * project record.
 */
export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/canvas'>,
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

  let canvas: unknown
  try {
    canvas = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Upload the canvas JSON to the private Blob store. A fixed pathname +
  // `allowOverwrite` keeps a single blob per project (no random suffix).
  const blob = await put(canvasBlobPath(projectId), JSON.stringify(canvas), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await updateProjectCanvasJsonPath(projectId, blob.url)

  return NextResponse.json({ url: blob.url })
}

/**
 * GET /api/projects/[projectId]/canvas — load the saved canvas JSON.
 * Reads the saved blob URL from Prisma, fetches the JSON from Blob, and returns
 * it. `canvas` is null when the project has never been saved.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/projects/[projectId]/canvas'>,
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

  if (!project.canvasJsonPath) {
    return NextResponse.json({ canvas: null })
  }

  // Private blobs require an authenticated read; `useCache: false` skips the CDN
  // so a freshly-saved snapshot isn't shadowed by a stale cached copy.
  const result = await get(project.canvasJsonPath, {
    access: 'private',
    useCache: false,
  })
  if (!result || result.statusCode !== 200) {
    return NextResponse.json({ canvas: null })
  }

  const text = await new Response(result.stream).text()
  const canvas = JSON.parse(text)
  return NextResponse.json({ canvas })
}
