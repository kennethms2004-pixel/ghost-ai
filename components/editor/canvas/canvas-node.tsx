"use client";

import {
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Handle,
  NodeResizer,
  type NodeProps,
  Position,
} from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { nodeTextColorForFill, SHAPE_MIN_SIZE } from "@/types/canvas";
import { ShapeGraphic } from "./shape-graphic";
import { useNodeActions } from "./node-actions";
import { NodeColorToolbar } from "./node-color-toolbar";

/** Sides that expose a connection handle. */
const HANDLE_POSITIONS = [
  Position.Top,
  Position.Right,
  Position.Bottom,
  Position.Left,
] as const;

/** Placeholder shown (and used in the editor) when a node has no label yet. */
const LABEL_PLACEHOLDER = "Add label";

/**
 * Renderer for the custom canvas node type. The shape silhouette comes from the
 * shared {@link ShapeGraphic} (CSS box for rectangle/pill/circle, inline SVG for
 * diamond/hexagon/cylinder), with the label centered on top. The node's
 * width/height come from the node `style` set when it is dropped.
 *
 * When selected, a {@link NodeResizer} exposes subtle corner/edge handles that
 * resize the node (down to {@link SHAPE_MIN_SIZE}). Double-clicking the label
 * area opens an inline textarea overlay; edits write through to collaborative
 * storage via {@link useNodeActions}.
 */
export function CanvasNodeView({ id, data, selected }: NodeProps<CanvasNode>) {
  const textColor = nodeTextColorForFill(data.color);
  const { updateNodeLabel, pauseHistory, resumeHistory } = useNodeActions();

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Editing is only ever active while the node is selected, so deselecting the
  // node (e.g. clicking the canvas) implicitly ends editing without an effect.
  const editing = isEditing && selected;

  // Focus and select the label when editing opens.
  useEffect(() => {
    if (!editing) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.select();
  }, [editing]);

  // Pause history for the whole editing session so undo/redo treats the typed
  // label as one step instead of one entry per keystroke. Resuming on cleanup
  // covers blur, Escape/Enter, and deselecting the node.
  useEffect(() => {
    if (!editing) return;
    pauseHistory();
    return () => resumeHistory();
  }, [editing, pauseHistory, resumeHistory]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Keep keystrokes inside the editor: stops React Flow from treating
    // Backspace/Delete as "delete node" and other keys as canvas shortcuts.
    event.stopPropagation();
    if (event.key === "Escape") {
      event.preventDefault();
      setIsEditing(false);
    }
    // Enter commits the label and closes the editor; Shift+Enter inserts a
    // line break. Without this, a bare Enter would just push the typed text
    // out of the single-line textarea, making it look like the label vanished.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      setIsEditing(false);
    }
  }

  return (
    <div className="group relative h-full w-full">
      <NodeColorToolbar nodeId={id} visible={selected} activeColor={data.color} />

      <NodeResizer
        isVisible={selected}
        minWidth={SHAPE_MIN_SIZE.width}
        minHeight={SHAPE_MIN_SIZE.height}
        color="#00c8d4"
        handleClassName="!h-2 !w-2 !rounded-sm !border-none !bg-brand"
        lineClassName="!border-brand/40"
      />

      <ShapeGraphic
        shape={data.shape}
        fill={data.color}
        stroke={textColor}
        selected={selected}
      />

      {/* All four sides are connectable. `!z-10` lifts the handles above the
          label overlay below (an `absolute inset-0` div rendered after them) —
          otherwise the overlay covers the inner half of each handle and only the
          top handle, whose grab area sits above the node box, stays clickable.
          `!pointer-events-auto` keeps them grabbable even before React Flow adds
          its `connectionindicator` class (handles are `pointer-events: none` by
          default). Loose connection mode makes every source handle bidirectional. */}
      {HANDLE_POSITIONS.map((position) => (
        <Handle
          key={position}
          id={position}
          type="source"
          position={position}
          className="!pointer-events-auto !z-10 !h-2.5 !w-2.5 !rounded-full !border !border-surface-border !bg-white opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        />
      ))}

      <div
        className="absolute inset-0 flex items-center justify-center px-3 text-center text-sm"
        onDoubleClick={() => setIsEditing(true)}
        style={{ color: textColor }}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            rows={1}
            value={data.label}
            placeholder={LABEL_PLACEHOLDER}
            onChange={(event) => updateNodeLabel(id, event.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            className="nodrag nopan w-full resize-none break-words bg-transparent text-center text-sm leading-tight outline-none placeholder:opacity-40"
            style={{ color: textColor }}
          />
        ) : data.label ? (
          <span className="line-clamp-2 break-words">{data.label}</span>
        ) : (
          <span className="line-clamp-2 break-words opacity-40">
            {LABEL_PLACEHOLDER}
          </span>
        )}
      </div>
    </div>
  );
}
