import type { NodeShape } from "@/types/canvas";

/** Shapes drawn as inline SVG; the rest are CSS-rounded boxes. */
const SVG_SHAPES: ReadonlySet<NodeShape> = new Set([
  "diamond",
  "hexagon",
  "cylinder",
]);

/** Stroke opacity at rest vs. selected — borders stay subtle until selected. */
const REST_STROKE_OPACITY = 0.4;
const SELECTED_STROKE_OPACITY = 1;

interface ShapeGraphicProps {
  shape: NodeShape;
  fill: string;
  stroke: string;
  /** Whether the host node is selected; brightens and thickens the border. */
  selected?: boolean;
}

/** Appends an 8-bit alpha channel to a 6-digit hex color (e.g. `#52A8FF` -> `#52A8FF66`). */
function withAlpha(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

/**
 * The visual silhouette of a canvas shape, stretched to fill its container.
 * Shared by the live canvas node and the drag preview so the ghost the user
 * drags is pixel-identical to the node they drop. Borders stay subtle at rest
 * and brighten + thicken while the node is selected.
 */
export function ShapeGraphic({ shape, fill, stroke, selected = false }: ShapeGraphicProps) {
  const strokeOpacity = selected ? SELECTED_STROKE_OPACITY : REST_STROKE_OPACITY;
  const strokeWidth = selected ? 2.5 : 2;

  if (SVG_SHAPES.has(shape)) {
    return (
      <ShapeSvg
        shape={shape}
        fill={fill}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      />
    );
  }

  // rectangle / pill / circle — a rounded box. Pill and circle are fully rounded
  // (circle is square-sized, so a full radius reads as a circle).
  const borderRadius = shape === "rectangle" ? "0.5rem" : "9999px";

  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundColor: fill,
        border: `${strokeWidth}px solid ${withAlpha(stroke, strokeOpacity)}`,
        borderRadius,
      }}
    />
  );
}

interface ShapeSvgProps extends ShapeGraphicProps {
  strokeOpacity: number;
  strokeWidth: number;
}

/** Inline SVG outlines for the complex shapes, drawn in a 0–100 viewBox. */
function ShapeSvg({ shape, fill, stroke, strokeOpacity, strokeWidth }: ShapeSvgProps) {
  const shared = {
    fill,
    stroke,
    strokeOpacity,
    strokeWidth,
    vectorEffect: "non-scaling-stroke" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      className="absolute inset-0 h-full w-full overflow-visible"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {shape === "diamond" && <polygon points="50,2 98,50 50,98 2,50" {...shared} />}

      {shape === "hexagon" && (
        <polygon points="25,3 75,3 98,50 75,97 25,97 2,50" {...shared} />
      )}

      {shape === "cylinder" && (
        <>
          <path d="M2,12 a48,10 0 0 1 96,0 v76 a48,10 0 0 1 -96,0 z" {...shared} />
          <path
            d="M2,12 a48,10 0 0 0 96,0"
            fill="none"
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}
    </svg>
  );
}
