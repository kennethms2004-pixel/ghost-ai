"use client";

import { Sparkles } from "lucide-react";
import { useAiSidebar } from "./ai-sidebar-context";

/**
 * Right-hand AI chat panel placeholder. Visibility is driven by the navbar's AI
 * toggle via {@link useAiSidebar}; real chat behavior arrives in a later feature.
 */
export function AiChatSidebar() {
  const { isOpen } = useAiSidebar();

  if (!isOpen) return null;

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-l border-surface-border bg-surface"
      aria-label="AI assistant"
    >
      <div className="flex items-center gap-2 border-b border-surface-border px-4 py-3">
        <Sparkles className="h-4 w-4 text-ai-text" />
        <span className="text-sm font-medium text-copy-primary">
          AI Assistant
        </span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="text-sm text-copy-muted">AI chat coming soon</p>
        <p className="text-xs text-copy-faint">
          Generate and refine your design with AI.
        </p>
      </div>
    </aside>
  );
}
