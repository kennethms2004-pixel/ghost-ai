import { useEffect, useRef } from "react";
import type { OnEdgesChange, OnNodesChange } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface CanvasHistory {
  pause: () => void;
  resume: () => void;
}

interface UseCanvasLoaderOptions {
  projectId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  onNodesChange: OnNodesChange<CanvasNode>;
  onEdgesChange: OnEdgesChange<CanvasEdge>;
  history: CanvasHistory;
  /** Called once the load attempt resolves (loaded, empty, or skipped). */
  onLoaded: () => void;
}

/**
 * One-shot loader for a project's saved canvas. On mount it checks the
 * Liveblocks room: if it already holds nodes/edges, active collaboration owns
 * the state and the saved snapshot is ignored. Only when the room is empty does
 * it fetch `GET /api/projects/[id]/canvas` and apply the saved nodes/edges
 * through the same Liveblocks write path as everything else (one undo step).
 *
 * Latest values are read through refs so the effect can run exactly once
 * (deps: `[projectId]`) without re-firing on every node/edge change.
 */
export function useCanvasLoader({
  projectId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  history,
  onLoaded,
}: UseCanvasLoaderOptions) {
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const onNodesChangeRef = useRef(onNodesChange);
  const onEdgesChangeRef = useRef(onEdgesChange);
  const historyRef = useRef(history);
  const onLoadedRef = useRef(onLoaded);

  // Keep refs current so the one-shot load effect (deps: [projectId]) always
  // reads the latest values — letting it re-check room emptiness after the
  // async fetch without re-firing on every node/edge change.
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
    onNodesChangeRef.current = onNodesChange;
    onEdgesChangeRef.current = onEdgesChange;
    historyRef.current = history;
    onLoadedRef.current = onLoaded;
  });

  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    // Room already has content → collaboration is live; never overwrite it.
    if (nodesRef.current.length > 0 || edgesRef.current.length > 0) {
      onLoadedRef.current();
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/canvas`);
        if (!res.ok) return;
        const { canvas } = await res.json();
        const loadedNodes: CanvasNode[] = Array.isArray(canvas?.nodes)
          ? canvas.nodes
          : [];
        const loadedEdges: CanvasEdge[] = Array.isArray(canvas?.edges)
          ? canvas.edges
          : [];
        if (cancelled) return;
        // Re-check emptiness — a collaborator may have started drawing while we
        // were fetching; if so, defer to their live state.
        if (nodesRef.current.length > 0 || edgesRef.current.length > 0) return;
        if (loadedNodes.length === 0 && loadedEdges.length === 0) return;

        historyRef.current.pause();
        try {
          onNodesChangeRef.current(
            loadedNodes.map((item) => ({ type: "add" as const, item })),
          );
          onEdgesChangeRef.current(
            loadedEdges.map((item) => ({ type: "add" as const, item })),
          );
        } finally {
          historyRef.current.resume();
        }
      } finally {
        if (!cancelled) onLoadedRef.current();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);
}
