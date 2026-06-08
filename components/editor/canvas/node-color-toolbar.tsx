"use client";

import { CSSProperties } from "react";
import { NodeToolbar, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { NODE_COLORS } from "@/types/canvas";
import { useNodeActions } from "./node-actions";

interface NodeColorToolbarProps {
  /** Id of the node this toolbar controls. */
  nodeId: string;
  /** Whether the node is selected — the toolbar only shows when it is. */
  visible: boolean;
  /** The node's current fill color, used to mark the active swatch. */
  activeColor: string;
}

/** Custom property carrying a swatch's paired text color for the hover glow. */
type SwatchStyle = CSSProperties & { "--swatch-glow": string };

/**
 * Floating swatch toolbar shown just above a selected node. Each swatch is one
 * {@link NODE_COLORS} pair (fill + paired text color); selecting one writes the
 * fill through {@link useNodeActions} (the collaborative write path) and the
 * node's text color follows automatically since it is derived from the fill.
 *
 * Rendered via React Flow's {@link NodeToolbar} so it tracks the node and sits
 * above it without overlapping. Interactions carry `nodrag nopan` so clicking a
 * swatch never drags the node or pans the canvas.
 */
export function NodeColorToolbar({
  nodeId,
  visible,
  activeColor,
}: NodeColorToolbarProps) {
  const { updateNodeColor } = useNodeActions();

  return (
    <NodeToolbar
      isVisible={visible}
      position={Position.Top}
      offset={12}
      className="nodrag nopan flex items-center gap-1 rounded-xl border border-surface-border bg-surface/90 p-1.5 shadow-lg backdrop-blur"
    >
      {NODE_COLORS.map((color) => {
        const isActive = color.fill === activeColor;

        return (
          <button
            key={color.name}
            type="button"
            title={`${color.name[0].toUpperCase()}${color.name.slice(1)}`}
            aria-label={`Set ${color.name} color`}
            aria-pressed={isActive}
            onClick={() => updateNodeColor(nodeId, color.fill)}
            style={{ "--swatch-glow": color.text } as SwatchStyle}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150",
              "hover:scale-110 hover:shadow-[0_0_6px_1px_var(--swatch-glow)]",
              isActive && "scale-110",
            )}
          >
            {/* Single solid swatch in the pair's text color. The active swatch
                gets a ring in its own color, offset from the swatch surface. */}
            <span
              className="h-3.5 w-3.5 rounded-full transition-all duration-150"
              style={{
                backgroundColor: color.text,
                boxShadow: isActive ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${color.text}` : undefined,
              }}
            />
          </button>
        );
      })}
    </NodeToolbar>
  );
}
