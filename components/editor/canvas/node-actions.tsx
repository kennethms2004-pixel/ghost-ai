"use client";

import { createContext, useContext } from "react";

/**
 * Mutations a custom node can perform on shared canvas state. The provider in
 * {@link FlowCanvasSurface} routes these through React Flow's `onNodesChange`
 * (the same path drag/resize use), which is the Liveblocks write path — so node
 * edits sync to every client in the room.
 */
export interface NodeActions {
  /** Replaces a node's label, writing through to collaborative storage. */
  updateNodeLabel: (id: string, label: string) => void;
  /**
   * Sets a node's fill color (one of {@link NODE_COLORS}' `fill` values),
   * writing through to collaborative storage. The paired text color is derived
   * from the fill at render time, so only the fill is stored.
   */
  updateNodeColor: (id: string, color: string) => void;
  /**
   * Pauses Liveblocks history so a run of edits (e.g. typing a label) collapses
   * into a single undo step. Must be balanced with {@link resumeHistory}.
   */
  pauseHistory: () => void;
  /** Resumes Liveblocks history, committing the paused edits as one undo step. */
  resumeHistory: () => void;
}

const NodeActionsContext = createContext<NodeActions | null>(null);

export const NodeActionsProvider = NodeActionsContext.Provider;

/** Reads the {@link NodeActions} provided by the canvas surface. */
export function useNodeActions(): NodeActions {
  const actions = useContext(NodeActionsContext);
  if (!actions) {
    throw new Error("useNodeActions must be used within a NodeActionsProvider");
  }
  return actions;
}
