import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/auth";
import { findAccessibleProject } from "@/lib/projects";

/**
 * Placeholder workspace. Confirms the user can access the project (owner or
 * collaborator) and shows its identity; the real canvas arrives in a later
 * feature. The route exists so creating a project has a destination to open.
 */
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId, email } = await getCurrentUserContext();

  if (!userId) notFound();

  const project = await findAccessibleProject(projectId, userId, email);
  if (!project) notFound();

  return (
    <main className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">{project.name}</h1>
      <p className="text-sm text-copy-muted">
        Room ID <span className="font-mono text-copy-secondary">{project.id}</span>
      </p>
      <p className="text-sm text-copy-faint">Workspace canvas coming soon.</p>
    </main>
  );
}
