import { Workflow } from "lucide-react";

/**
 * Central canvas placeholder. The real React Flow / Liveblocks canvas arrives
 * in a later feature; for now this fills the workspace's main area.
 */
export function WorkspaceCanvas() {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-base text-center">
      <Workflow className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">Canvas coming soon</p>
      <p className="text-xs text-copy-faint">
        This is where your architecture canvas will live.
      </p>
    </div>
  );
}
