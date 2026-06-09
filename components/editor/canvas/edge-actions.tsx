"use client";

import { createContext, useContext } from "react";

/**
 * Edge interaction state and mutations shared between the canvas surface and the
 * custom edge renderer. Hover and editing state live on the surface (driven by
 * React Flow's edge mouse/double-click handlers) so the renderer can react to
 * them, and {@link EdgeActions.updateEdgeLabel} routes label edits through React
 * Flow's `onEdgesChange` — the same Liveblocks write path connections use — so
 * labels sync to every client in the room.
 */
export interface EdgeActions {
  /** Id of the edge currently hovered, or `null`. */
  hoveredEdgeId: string | null;
  /** Id of the edge whose label is being edited inline, or `null`. */
  editingEdgeId: string | null;
  /** Opens (`id`) or closes (`null`) inline label editing for an edge. */
  setEditingEdgeId: (id: string | null) => void;
  /** Replaces an edge's label, writing through to collaborative storage. */
  updateEdgeLabel: (id: string, label: string) => void;
  /**
   * Pauses Liveblocks history so a run of edits (e.g. typing a label) collapses
   * into a single undo step. Must be balanced with {@link resumeHistory}.
   */
  pauseHistory: () => void;
  /** Resumes Liveblocks history, committing the paused edits as one undo step. */
  resumeHistory: () => void;
}

const EdgeActionsContext = createContext<EdgeActions | null>(null);

export const EdgeActionsProvider = EdgeActionsContext.Provider;

/** Reads the {@link EdgeActions} provided by the canvas surface. */
export function useEdgeActions(): EdgeActions {
  const actions = useContext(EdgeActionsContext);
  if (!actions) {
    throw new Error("useEdgeActions must be used within an EdgeActionsProvider");
  }
  return actions;
}
