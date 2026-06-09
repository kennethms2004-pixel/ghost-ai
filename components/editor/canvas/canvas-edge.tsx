"use client";

import { type KeyboardEvent, useEffect, useRef } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";
import { type CanvasEdge, DEFAULT_EDGE_COLOR } from "@/types/canvas";
import { useEdgeActions } from "./edge-actions";

/** Corner rounding for the right-angle routing — small, so corners read crisp. */
const EDGE_BORDER_RADIUS = 8;
/** Invisible hit area around the line, so edges are easy to hover/click. */
const EDGE_INTERACTION_WIDTH = 24;
/** Placeholder shown (and used in the editor) when an active edge has no label. */
const LABEL_PLACEHOLDER = "Add label";

/**
 * Renderer for the custom canvas edge type. Routes the edge with clean
 * right-angle steps via {@link getSmoothStepPath}, keeps the line dimmed at rest
 * and brightens it when hovered, selected, or editing. The visible stroke stays
 * thin while a wide invisible interaction path (`interactionWidth`) makes the
 * edge easy to hover and click.
 *
 * The label sits at the path midpoint coordinates returned by
 * `getSmoothStepPath` (never computed by hand) and is rendered through
 * {@link EdgeLabelRenderer}. Double-clicking the edge opens an inline input that
 * grows with its text; edits write through to collaborative storage via
 * {@link useEdgeActions} and persist on blur, Enter, or Escape.
 */
export function CanvasEdgeView({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const {
    hoveredEdgeId,
    editingEdgeId,
    setEditingEdgeId,
    updateEdgeLabel,
    pauseHistory,
    resumeHistory,
  } = useEdgeActions();

  const editing = editingEdgeId === id;
  const active = editing || selected === true || hoveredEdgeId === id;
  const label = data?.label ?? "";

  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: EDGE_BORDER_RADIUS,
  });

  // Focus and select the input when editing opens.
  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, [editing]);

  // Pause history for the whole editing session so undo/redo treats the typed
  // label as one step instead of one entry per keystroke.
  useEffect(() => {
    if (!editing) return;
    pauseHistory();
    return () => resumeHistory();
  }, [editing, pauseHistory, resumeHistory]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Keep keystrokes inside the editor: stops React Flow from treating
    // Backspace/Delete as "delete edge" and other keys as canvas shortcuts.
    event.stopPropagation();
    if (event.key === "Escape" || event.key === "Enter") {
      event.preventDefault();
      setEditingEdgeId(null);
    }
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={EDGE_INTERACTION_WIDTH}
        style={{
          stroke: DEFAULT_EDGE_COLOR,
          strokeOpacity: active ? 1 : 0.45,
          strokeWidth: active ? 2 : 1.5,
          strokeLinecap: "round",
          transition: "stroke-opacity 150ms, stroke-width 150ms",
        }}
      />

      <EdgeLabelRenderer>
        <div
          // `nodrag nopan` + auto pointer-events keep label clicks and typing
          // from dragging the node behind it or panning the canvas.
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          onDoubleClick={(event) => {
            event.stopPropagation();
            setEditingEdgeId(id);
          }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={label}
              placeholder={LABEL_PLACEHOLDER}
              size={Math.max(label.length, LABEL_PLACEHOLDER.length)}
              onChange={(event) => updateEdgeLabel(id, event.target.value)}
              onBlur={() => setEditingEdgeId(null)}
              onKeyDown={handleKeyDown}
              className="rounded-full border border-surface-border bg-elevated px-2 py-0.5 text-center text-xs text-copy-primary outline-none ring-1 ring-brand/50 placeholder:text-copy-faint"
            />
          ) : label ? (
            <span className="rounded-full border border-surface-border bg-surface/90 px-2 py-0.5 text-xs text-copy-secondary backdrop-blur">
              {label}
            </span>
          ) : active ? (
            <span className="rounded-full px-2 py-0.5 text-xs text-copy-faint">
              {LABEL_PLACEHOLDER}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
