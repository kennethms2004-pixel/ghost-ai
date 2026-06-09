import { nodeTextColorForFill, SHAPE_DEFAULT_SIZES } from "@/types/canvas";
import type { CanvasNode } from "@/types/canvas";
import type { CanvasTemplate } from "./starter-templates";

/** Padding (in canvas units) added around the computed bounds. */
const BOUNDS_PADDING = 24;

/** Dimmed line color for preview edges (the canvas edge color at rest). */
const DEFAULT_EDGE_PREVIEW_COLOR = "rgba(248, 250, 252, 0.4)";

interface NodeRect {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

/** Resolves a node's box from its position and (style or default) size. */
function rectFor(node: CanvasNode): NodeRect {
  const fallback = SHAPE_DEFAULT_SIZES[node.data.shape];
  const width = Number(node.style?.width ?? fallback.width);
  const height = Number(node.style?.height ?? fallback.height);
  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
    cx: node.position.x + width / 2,
    cy: node.position.y + height / 2,
  };
}

/** Renders one node's silhouette as an SVG primitive matching its shape. */
function NodeShapeSvg({ node, rect }: { node: CanvasNode; rect: NodeRect }) {
  const fillColor = node.data.color;
  const stroke = nodeTextColorForFill(fillColor);
  const common = {
    fill: fillColor,
    stroke,
    strokeWidth: 1.5,
    vectorEffect: "non-scaling-stroke" as const,
  };
  const { x, y, width, height, cx, cy } = rect;

  switch (node.data.shape) {
    case "circle":
      return <ellipse cx={cx} cy={cy} rx={width / 2} ry={height / 2} {...common} />;
    case "diamond":
      return (
        <polygon
          points={`${cx},${y} ${x + width},${cy} ${cx},${y + height} ${x},${cy}`}
          {...common}
        />
      );
    case "hexagon": {
      const inset = width * 0.22;
      return (
        <polygon
          points={`${x + inset},${y} ${x + width - inset},${y} ${x + width},${cy} ${x + width - inset},${y + height} ${x + inset},${y + height} ${x},${cy}`}
          {...common}
        />
      );
    }
    case "cylinder": {
      const ry = Math.min(height * 0.16, 12);
      return (
        <g {...common}>
          <rect x={x} y={y + ry} width={width} height={height - ry * 2} fill={fillColor} stroke="none" />
          <line x1={x} y1={y + ry} x2={x} y2={y + height - ry} />
          <line x1={x + width} y1={y + ry} x2={x + width} y2={y + height - ry} />
          <ellipse cx={cx} cy={y + height - ry} rx={width / 2} ry={ry} fill={fillColor} />
          <ellipse cx={cx} cy={y + ry} rx={width / 2} ry={ry} />
        </g>
      );
    }
    case "pill":
      return <rect x={x} y={y} width={width} height={height} rx={height / 2} ry={height / 2} {...common} />;
    case "rectangle":
    default:
      return <rect x={x} y={y} width={width} height={height} rx={8} ry={8} {...common} />;
  }
}

/**
 * A lightweight, static diagram preview for a template — no React Flow instance.
 * Bounds are computed from the node positions/sizes and fed to the SVG `viewBox`
 * so the whole diagram fits the fixed-size viewport. Edges are drawn as simple
 * lines between node centers; nodes use their shape and color data.
 */
export function StarterTemplatePreview({ template }: { template: CanvasTemplate }) {
  const rects = new Map(template.nodes.map((n) => [n.id, rectFor(n)]));

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const r of rects.values()) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  // Guard against an empty template (shouldn't happen, but keeps the math safe).
  if (!Number.isFinite(minX)) {
    return <div className="h-full w-full rounded-lg bg-base" />;
  }

  const vbX = minX - BOUNDS_PADDING;
  const vbY = minY - BOUNDS_PADDING;
  const vbWidth = maxX - minX + BOUNDS_PADDING * 2;
  const vbHeight = maxY - minY + BOUNDS_PADDING * 2;

  return (
    <svg
      viewBox={`${vbX} ${vbY} ${vbWidth} ${vbHeight}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full"
      role="img"
      aria-label={`${template.name} diagram preview`}
    >
      {template.edges.map((e) => {
        const source = rects.get(e.source);
        const target = rects.get(e.target);
        if (!source || !target) return null;
        return (
          <line
            key={e.id}
            x1={source.cx}
            y1={source.cy}
            x2={target.cx}
            y2={target.cy}
            stroke={DEFAULT_EDGE_PREVIEW_COLOR}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {template.nodes.map((n) => {
        const rect = rects.get(n.id);
        if (!rect) return null;
        return <NodeShapeSvg key={n.id} node={n} rect={rect} />;
      })}
    </svg>
  );
}
