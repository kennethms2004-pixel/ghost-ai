import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown when a workspace is missing or the current user has no access to it.
 * Missing and unauthorized intentionally look identical so existence is never
 * leaked.
 */
export function AccessDenied() {
  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-border bg-surface">
        <Lock className="h-8 w-8 text-copy-muted" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-lg font-semibold text-copy-primary">
          Project not available
        </h1>
        <p className="max-w-sm text-sm text-copy-muted">
          This project doesn’t exist, or you don’t have access to it.
        </p>
      </div>

      <Button variant="outline" size="sm" render={<Link href="/editor" />}>
        Back to projects
      </Button>
    </div>
  );
}
