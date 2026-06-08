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

/**
 * Rename a project, scoped to its owner so the ownership check and the write
 * happen atomically. Throws Prisma `P2025` when no project matches the id and
 * owner (missing or not owned); callers map that to a 404.
 */
export function renameProject(projectId: string, ownerId: string, name: string) {
  return prisma.project.update({
    where: { id: projectId, ownerId },
    data: { name: name.trim() },
  })
}

/**
 * Delete a project, scoped to its owner so the ownership check and the write
 * happen atomically. Throws Prisma `P2025` when no project matches the id and
 * owner (missing or not owned); callers map that to a 404.
 */
export function deleteProject(projectId: string, ownerId: string) {
  return prisma.project.delete({ where: { id: projectId, ownerId } })
}

/** List a project's collaborators by email, oldest invite first. */
export function listProjectCollaborators(projectId: string) {
  return prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })
}

/**
 * Add a collaborator to a project by email, scoped to the owner so the
 * ownership check and the write happen atomically — the nested create only runs
 * when the project belongs to this owner. Emails are stored lowercase so
 * collaborator lookups match regardless of casing. Throws Prisma `P2025` when no
 * project matches the id and owner (callers map to 404) and `P2002` when the
 * email is already a collaborator (callers map to 409).
 */
export function addProjectCollaborator(
  projectId: string,
  ownerId: string,
  email: string,
) {
  return prisma.project.update({
    where: { id: projectId, ownerId },
    data: {
      collaborators: { create: { email: email.trim().toLowerCase() } },
    },
  })
}

/**
 * Remove a collaborator from a project by email, scoped to the owner so the
 * ownership check and the write happen atomically. Throws Prisma `P2025` when no
 * project matches the id and owner (callers map to 404). Removing an email that
 * is not a collaborator is a no-op.
 */
export function removeProjectCollaborator(
  projectId: string,
  ownerId: string,
  email: string,
) {
  return prisma.project.update({
    where: { id: projectId, ownerId },
    data: {
      collaborators: { deleteMany: { email: email.trim().toLowerCase() } },
    },
  })
}
