"use client";

import { useEffect } from "react";
import type { ReactFlowInstance } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

/** Smooth-motion duration (ms) for keyboard-triggered zooms — matches the control bar. */
const ZOOM_DURATION_MS = 200;

interface KeyboardShortcutsOptions {
  /** The active React Flow instance, used to drive zoom shortcuts. */
  reactFlow: ReactFlowInstance<CanvasNode, CanvasEdge>;
  /** Called for Cmd/Ctrl + Z. */
  onUndo: () => void;
  /** Called for Cmd/Ctrl + Shift + Z and Cmd/Ctrl + Y. */
  onRedo: () => void;
}

/**
 * Returns true when the event originates from a field where the user is typing
 * (input, textarea, or any contentEditable element), so we don't hijack keys
 * like `-` or Cmd+Z while editing a node/edge label.
 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Wires canvas keyboard shortcuts on `window`:
 * - `+` / `=` zoom in, `-` zoom out
 * - Cmd/Ctrl + Z undo
 * - Cmd/Ctrl + Shift + Z (or Cmd/Ctrl + Y) redo
 *
 * Shortcuts are ignored while the user is typing in an editable field.
 */
export function useKeyboardShortcuts({
  reactFlow,
  onUndo,
  onRedo,
}: KeyboardShortcutsOptions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isEditableTarget(event.target)) return;

      const mod = event.metaKey || event.ctrlKey;

      if (mod) {
        const key = event.key.toLowerCase();
        if (key === "z") {
          event.preventDefault();
          if (event.shiftKey) onRedo();
          else onUndo();
          return;
        }
        if (key === "y") {
          event.preventDefault();
          onRedo();
          return;
        }
        return;
      }

      switch (event.key) {
        case "+":
        case "=":
          event.preventDefault();
          void reactFlow.zoomIn({ duration: ZOOM_DURATION_MS });
          break;
        case "-":
          event.preventDefault();
          void reactFlow.zoomOut({ duration: ZOOM_DURATION_MS });
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [reactFlow, onUndo, onRedo]);
}
