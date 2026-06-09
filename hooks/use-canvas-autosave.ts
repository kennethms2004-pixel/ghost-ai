import { useCallback, useEffect, useRef } from "react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";
import type { CanvasSaveStatus } from "@/components/editor/canvas-save-status-context";

/** Delay between the last canvas edit and a persisted save. */
const AUTOSAVE_DEBOUNCE_MS = 1500;

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  /**
   * Gate that turns autosave on. Kept off until the initial load attempt
   * resolves so an empty mount never overwrites a saved snapshot before it loads.
   */
  enabled: boolean;
  onStatus: (status: CanvasSaveStatus) => void;
}

/**
 * Debounced autosave for the collaborative canvas. Watches nodes/edges and, once
 * `enabled`, persists changes through `PUT /api/projects/[id]/canvas` (Vercel
 * Blob + Prisma metadata). Tracks save status via `onStatus`.
 *
 * The first serialized snapshot seen after enabling is treated as already-saved
 * (it's the loaded/initial state), so loading existing work doesn't immediately
 * trigger a redundant write — only genuine subsequent edits save.
 *
 * Returns `saveNow`, an imperative save the navbar's Save button calls: it
 * cancels any pending debounce and writes the current snapshot immediately.
 */
export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled,
  onStatus,
}: UseCanvasAutosaveOptions): { saveNow: () => Promise<void> } {
  const lastSavedRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep the latest inputs in refs so `saveNow` (a stable callback) always reads
  // current values without being recreated on every node/edge change.
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const projectIdRef = useRef(projectId);
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    projectIdRef.current = projectId;
    onStatusRef.current = onStatus;
  });

  // The single write path, shared by the debounced autosave and `saveNow`.
  const persist = useCallback(async (serialized: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onStatusRef.current("saving");
    try {
      const res = await fetch(`/api/projects/${projectIdRef.current}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: serialized,
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      lastSavedRef.current = serialized;
      onStatusRef.current("saved");
    } catch {
      onStatusRef.current("error");
    }
  }, []);

  // Manual save: always writes the current snapshot, bypassing the debounce and
  // the "first snapshot is the baseline" rule (the user explicitly asked to save).
  const saveNow = useCallback(async () => {
    const serialized = JSON.stringify({
      nodes: nodesRef.current,
      edges: edgesRef.current,
    });
    await persist(serialized);
  }, [persist]);

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify({ nodes, edges });

    // First snapshot after enabling = the loaded/initial state; record it as the
    // baseline without saving so we don't echo it straight back to Blob.
    if (lastSavedRef.current === null) {
      lastSavedRef.current = serialized;
      return;
    }

    // No real change since the last save → nothing to do.
    if (serialized === lastSavedRef.current) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void persist(serialized), AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, projectId, nodes, edges, persist]);

  return { saveNow };
}
