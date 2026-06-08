"use client";

import { type DragEvent, useRef, useState } from "react";
import {
  Circle,
  Cylinder,
  Diamond,
  Hexagon,
  type LucideIcon,
  Pill,
  RectangleHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_NODE_COLOR,
  type NodeShape,
  nodeTextColorForFill,
  SHAPE_DEFAULT_SIZES,
  SHAPE_DRAG_MIME,
  type ShapeDragPayload,
} from "@/types/canvas";
import { ShapeGraphic } from "./shape-graphic";

interface ShapeOption {
  shape: NodeShape;
  label: string;
  icon: LucideIcon;
}

/** Draggable shapes shown in the panel, in display order. */
const SHAPE_OPTIONS: ShapeOption[] = [
  { shape: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { shape: "diamond", label: "Diamond", icon: Diamond },
  { shape: "circle", label: "Circle", icon: Circle },
  { shape: "pill", label: "Pill", icon: Pill },
  { shape: "cylinder", label: "Cylinder", icon: Cylinder },
  { shape: "hexagon", label: "Hexagon", icon: Hexagon },
];

const DRAG_STROKE = nodeTextColorForFill(DEFAULT_NODE_COLOR);

/**
 * Floating pill-shaped toolbar at the bottom-center of the canvas. Dragging a
 * button creates a node; the cursor carries a ghost of the exact shape (via
 * `setDragImage` on a hidden, pixel-identical preview) so it feels like you're
 * physically holding the shape, and the drag payload carries the shape + size.
 */
export function ShapePanel() {
  const [draggingShape, setDraggingShape] = useState<NodeShape | null>(null);
  /** Hidden preview elements handed to `setDragImage`, keyed by shape. */
  const previewRefs = useRef(new Map<NodeShape, HTMLDivElement>());

  function handleDragStart(event: DragEvent<HTMLButtonElement>, shape: NodeShape) {
    const size = SHAPE_DEFAULT_SIZES[shape];
    const payload: ShapeDragPayload = { shape, size };
    event.dataTransfer.setData(SHAPE_DRAG_MIME, JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";

    const preview = previewRefs.current.get(shape);
    if (preview) {
      // Center the ghost on the cursor so it reads as "held".
      event.dataTransfer.setDragImage(preview, size.width / 2, size.height / 2);
    }

    setDraggingShape(shape);
  }

  return (
    <>
      {/* Off-screen previews used as the drag ghost — rendered (not display:none)
          so the browser can snapshot them, kept out of view and non-interactive. */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
        {SHAPE_OPTIONS.map(({ shape }) => {
          const { width, height } = SHAPE_DEFAULT_SIZES[shape];
          return (
            <div
              key={shape}
              ref={(el) => {
                if (el) previewRefs.current.set(shape, el);
                else previewRefs.current.delete(shape);
              }}
              className="relative"
              style={{ width, height }}
            >
              <ShapeGraphic shape={shape} fill={DEFAULT_NODE_COLOR} stroke={DRAG_STROKE} />
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 shadow-lg backdrop-blur">
          {SHAPE_OPTIONS.map(({ shape, label, icon: Icon }) => {
            const isDragging = draggingShape === shape;
            const someOtherDragging = draggingShape !== null && !isDragging;

            return (
              <button
                key={shape}
                type="button"
                draggable
                onDragStart={(event) => handleDragStart(event, shape)}
                onDragEnd={() => setDraggingShape(null)}
                title={`Drag to add ${label.toLowerCase()}`}
                aria-label={`Drag to add ${label.toLowerCase()}`}
                className={cn(
                  "flex h-9 w-9 cursor-grab items-center justify-center rounded-full text-copy-secondary transition-all duration-150 hover:scale-110 hover:bg-elevated hover:text-copy-primary active:cursor-grabbing",
                  isDragging && "scale-110 bg-elevated text-brand shadow-md",
                  someOtherDragging && "opacity-40",
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
