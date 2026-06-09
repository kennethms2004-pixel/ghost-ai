"use client";

import { useAiSidebar } from "./ai-sidebar-context";
import { AiSidebar } from "./ai-sidebar/ai-sidebar";

/**
 * Connects the floating {@link AiSidebar} to the shared open state from
 * {@link useAiSidebar} (driven by the navbar's AI toggle). Always mounts the
 * sidebar so it can animate in/out; the parent here owns open/close.
 */
export function AiChatSidebar() {
  const { isOpen, close } = useAiSidebar();

  return <AiSidebar isOpen={isOpen} onClose={close} />;
}
