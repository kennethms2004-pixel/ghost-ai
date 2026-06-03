import 'server-only'
import { prisma } from '@/lib/prisma'

/**
 * Project data access. Route handlers own auth and ownership checks; this
 * module owns the persistence shape so the handlers stay thin.
 */

const DEFAULT_PROJECT_NAME = 'Untitled Project'

export interface CreateProjectInput {
  /**
   * Optional explicit id. The editor supplies the generated Liveblocks room id
   * here so the project's primary key and its room id stay the same value. When
   * omitted, the schema's cuid default assigns the id.
   */
  id?: string
  name?: string
  description?: string
}

/** List a single user's owned projects, newest first. */
export function listProjectsForOwner(ownerId: string) {
  return prisma.project.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * List projects shared with a user via a collaborator email, newest first.
 * Owned projects are excluded so they never appear in both lists.
 */
export function listSharedProjectsForCollaborator(email: string, ownerId: string) {
  return prisma.project.findMany({
    where: {
      ownerId: { not: ownerId },
      collaborators: { some: { email } },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/** Create a project owned by the given user. */
export function createProjectForOwner(ownerId: string, input: CreateProjectInput) {
  const name = input.name?.trim() || DEFAULT_PROJECT_NAME
  const description = input.description?.trim() || null

  return prisma.project.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      ownerId,
      name,
      description,
    },
  })
}

/** Fetch a project by id, or null if it does not exist. */
export function getProjectById(projectId: string) {
  return prisma.project.findUnique({ where: { id: projectId } })
}

/**
 * Fetch a project the user can access — as owner or as an invited collaborator.
 * Returns null when the project does not exist or the user has no access.
 */
export function findAccessibleProject(
  projectId: string,
  userId: string,
  email: string | null,
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: email
        ? [{ ownerId: userId }, { collaborators: { some: { email } } }]
        : [{ ownerId: userId }],
    },
  })
}

/** Rename a project. Caller must verify ownership first. */
export function renameProject(projectId: string, name: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: { name: name.trim() },
  })
}

/** Delete a project. Caller must verify ownership first. */
export function deleteProject(projectId: string) {
  return prisma.project.delete({ where: { id: projectId } })
}
