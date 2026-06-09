"use client";

import { createContext, useContext, useState } from "react";

/**
 * Open state for the starter-templates modal. Lives at the editor-shell level so
 * the navbar button (in the shared layout) can open a modal that is rendered by
 * the canvas (inside the Liveblocks room) — the import logic must run where the
 * collaborative node/edge state lives, so only the open state crosses the
 * layout/page boundary. Mirrors {@link AiSidebarProvider}.
 */
interface StarterTemplatesContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const StarterTemplatesContext =
  createContext<StarterTemplatesContextValue | null>(null);

export function StarterTemplatesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <StarterTemplatesContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </StarterTemplatesContext.Provider>
  );
}

export function useStarterTemplates() {
  const ctx = useContext(StarterTemplatesContext);
  if (!ctx) {
    throw new Error(
      "useStarterTemplates must be used within a StarterTemplatesProvider",
    );
  }
  return ctx;
}
