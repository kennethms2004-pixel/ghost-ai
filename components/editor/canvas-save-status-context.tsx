"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

/** Autosave lifecycle states surfaced in the navbar's Save button. */
export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Bridges the canvas autosave status (produced deep inside the Liveblocks room
 * by the autosave hook) up to the navbar's Save button (rendered in the shared
 * editor layout), and bridges the navbar button's click back down to the canvas
 * as an imperative "save now". Lives at the editor-shell level so both sides
 * share one piece of state across the layout/page boundary — mirrors
 * {@link AiSidebarProvider}.
 */
interface CanvasSaveStatusContextValue {
  status: CanvasSaveStatus;
  setStatus: (status: CanvasSaveStatus) => void;
  /** Trigger an immediate save (no-op until a canvas registers a handler). */
  save: () => void;
  /** Canvas registers (or clears) its save handler on mount/unmount. */
  registerSave: (handler: (() => void) | null) => void;
  /** Whether a canvas is currently mounted with a save handler available. */
  canSave: boolean;
}

const CanvasSaveStatusContext =
  createContext<CanvasSaveStatusContextValue | null>(null);

export function CanvasSaveStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle");
  const [canSave, setCanSave] = useState(false);
  // The active canvas's save handler. A ref (not state) so updating it on every
  // node/edge change doesn't re-render the navbar; `canSave` tracks presence.
  const saveRef = useRef<(() => void) | null>(null);

  const registerSave = useCallback((handler: (() => void) | null) => {
    saveRef.current = handler;
    setCanSave(Boolean(handler));
  }, []);

  const save = useCallback(() => {
    saveRef.current?.();
  }, []);

  return (
    <CanvasSaveStatusContext.Provider
      value={{ status, setStatus, save, registerSave, canSave }}
    >
      {children}
    </CanvasSaveStatusContext.Provider>
  );
}

export function useCanvasSaveStatus() {
  const ctx = useContext(CanvasSaveStatusContext);
  if (!ctx) {
    throw new Error(
      "useCanvasSaveStatus must be used within a CanvasSaveStatusProvider",
    );
  }
  return ctx;
}
