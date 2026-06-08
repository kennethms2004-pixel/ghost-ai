import type { Edge, Node } from "@xyflow/react";

/**
 * Shared canvas schema. These types and constants are the single source of truth
 * for canvas content — user-created nodes/edges and imported templates must both
 * conform to them (see the canvas-schema invariant in architecture-context.md).
 */

/**
 * Node color palette. Each entry pairs a dark node fill with a vivid contrasting
 * text color tuned for the dark canvas. The first entry is the default.
 */
export const NODE_COLORS = [
  { name: "neutral", fill: "#1F1F1F", text: "#EDEDED" },
  { name: "blue", fill: "#10233D", text: "#52A8FF" },
  { name: "purple", fill: "#2E1938", text: "#BF7AF0" },
  { name: "orange", fill: "#331B00", text: "#FF990A" },
  { name: "red", fill: "#3C1618", text: "#FF6166" },
  { name: "pink", fill: "#3A1726", text: "#F75F8F" },
  { name: "green", fill: "#0F2E18", text: "#62C073" },
  { name: "teal", fill: "#062822", text: "#0AC7B4" },
] as const;

/** Default node fill applied to new nodes. */
export const DEFAULT_NODE_COLOR = NODE_COLORS[0].fill;

/** Supported node shapes. */
export const NODE_SHAPES = [
  "rectangle",
  "diamond",
  "circle",
  "pill",
  "cylinder",
  "hexagon",
] as const;

export type NodeShape = (typeof NODE_SHAPES)[number];

/** Default shape applied to new nodes. */
export const DEFAULT_NODE_SHAPE: NodeShape = "rectangle";

/** Pixel dimensions of a node. */
export interface ShapeSize {
  width: number;
  height: number;
}

/**
 * Default size per shape, used when a shape is dropped onto the canvas.
 * Rectangles/pills are wider than tall, circles are square, and diamonds are
 * slightly larger so a centered label has room.
 */
export const SHAPE_DEFAULT_SIZES: Record<NodeShape, ShapeSize> = {
  rectangle: { width: 160, height: 64 },
  pill: { width: 160, height: 56 },
  circle: { width: 110, height: 110 },
  diamond: { width: 150, height: 110 },
  cylinder: { width: 130, height: 104 },
  hexagon: { width: 150, height: 96 },
};

/**
 * Minimum node dimensions enforced while resizing, so a node never shrinks
 * smaller than its label and handles can comfortably occupy.
 */
export const SHAPE_MIN_SIZE: ShapeSize = { width: 64, height: 44 };

/** Custom MIME type for the shape drag-and-drop payload. */
export const SHAPE_DRAG_MIME = "application/ghostai-shape";

/** Payload carried while dragging a shape from the shape panel onto the canvas. */
export interface ShapeDragPayload {
  shape: NodeShape;
  size: ShapeSize;
}

/** Resolves the contrasting text color for a node fill from {@link NODE_COLORS}. */
export function nodeTextColorForFill(fill: string): string {
  return NODE_COLORS.find((color) => color.fill === fill)?.text ?? NODE_COLORS[0].text;
}

/**
 * Data carried by every canvas node. The index signature satisfies React Flow's
 * `Record<string, unknown>` node-data constraint.
 */
export interface CanvasNodeData {
  label: string;
  /** Node fill color — one of {@link NODE_COLORS}' `fill` values. */
  color: string;
  shape: NodeShape;
  [key: string]: unknown;
}

/** Default stroke color for canvas edges — a light, near-white line. */
export const DEFAULT_EDGE_COLOR = "#f8fafc";

/**
 * Data carried by every canvas edge. The index signature satisfies React Flow's
 * `Record<string, unknown>` edge-data constraint.
 */
export interface CanvasEdgeData {
  /** Optional inline label shown as a pill badge at the edge midpoint. */
  label?: string;
  [key: string]: unknown;
}

/** React Flow type strings for the custom node and edge. */
export const CANVAS_NODE_TYPE = "canvasNode";
export const CANVAS_EDGE_TYPE = "canvasEdge";

export type CanvasNode = Node<CanvasNodeData, typeof CANVAS_NODE_TYPE>;
export type CanvasEdge = Edge<CanvasEdgeData, typeof CANVAS_EDGE_TYPE>;
