import { redirect } from "next/navigation";
import { AccessDenied } from "@/components/editor/access-denied";
import { AiChatSidebar } from "@/components/editor/ai-chat-sidebar";
import { WorkspaceCanvas } from "@/components/editor/workspace-canvas";
import { resolveProjectAccess } from "@/lib/project-access";

/**
 * Workspace shell for `/editor/[projectId]` (project id === Liveblocks room id).
 * Stays a server component for the access gate; the collaborative canvas and AI
 * panel are the client pieces it mounts. The navbar (project name, share, AI
 * toggle) and the project sidebar come from the editor layout's shell.
 */
export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const access = await resolveProjectAccess(projectId);

  if (access.status === "unauthenticated") redirect("/sign-in");
  if (access.status === "denied") return <AccessDenied />;

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      <WorkspaceCanvas roomId={projectId} />
      <AiChatSidebar />
    </div>
  );
}
