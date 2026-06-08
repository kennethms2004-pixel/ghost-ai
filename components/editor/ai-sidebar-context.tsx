"use client";

import { createContext, useContext, useState } from "react";

/**
 * Open state for the right-hand AI chat sidebar. Lives at the editor-shell
 * level so the navbar toggle (in the shared layout) and the AI panel (rendered
 * by the workspace page) share one piece of state across the layout/page
 * boundary.
 */
interface AiSidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const AiSidebarContext = createContext<AiSidebarContextValue | null>(null);

export function AiSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AiSidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((prev) => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </AiSidebarContext.Provider>
  );
}

export function useAiSidebar() {
  const ctx = useContext(AiSidebarContext);
  if (!ctx) {
    throw new Error("useAiSidebar must be used within an AiSidebarProvider");
  }
  return ctx;
}
