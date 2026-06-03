import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentUserContext } from "@/lib/auth";
import {
  listProjectsForOwner,
  listSharedProjectsForCollaborator,
} from "@/lib/projects";
import { slugify } from "@/lib/utils";
import type { Project } from "@/types/project";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, email } = await getCurrentUserContext();

  // Fetched server-side so the sidebar renders with real data on first paint —
  // no client-side fetch for the initial load.
  const [ownedRecords, sharedRecords] = await Promise.all([
    userId ? listProjectsForOwner(userId) : Promise.resolve([]),
    userId && email
      ? listSharedProjectsForCollaborator(email, userId)
      : Promise.resolve([]),
  ]);

  const ownedProjects: Project[] = ownedRecords.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    isOwner: true,
  }));
  const sharedProjects: Project[] = sharedRecords.map((p) => ({
    id: p.id,
    name: p.name,
    slug: slugify(p.name),
    isOwner: false,
  }));

  return (
    <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      {children}
    </EditorShell>
  );
}
