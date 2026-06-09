"use client";

import { useAiSidebar } from "./ai-sidebar-context";
import { AiSidebar } from "./ai-sidebar/ai-sidebar";

/**
 * Connects the floating {@link AiSidebar} to the shared open state from
 * {@link useAiSidebar} (driven by the navbar's AI toggle). This connector only
 * owns the open/close state; {@link AiSidebar} manages its own mount/unmount
 * lifecycle — it animates in on open and, via an `onTransitionEnd` guard,
 * unmounts itself once the slide-out completes.
 */
export function AiChatSidebar() {
  const { isOpen, close } = useAiSidebar();

  return <AiSidebar isOpen={isOpen} onClose={close} />;
}
