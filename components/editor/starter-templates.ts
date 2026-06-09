import { MarkerType } from "@xyflow/react";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  type CanvasEdge,
  type CanvasNode,
  DEFAULT_EDGE_COLOR,
  NODE_COLORS,
  type NodeShape,
  SHAPE_DEFAULT_SIZES,
} from "@/types/canvas";

/**
 * A pre-built canvas diagram a user can import as a starting point. Nodes and
 * edges use the shared canvas schema ({@link CanvasNode} / {@link CanvasEdge}),
 * so an imported template is indistinguishable from user-created content.
 */
export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

/** Gap (canvas units) left between existing content and an imported template. */
const IMPORT_GAP = 120;

/** Resolves a node's box size from its style, falling back to the shape default. */
function nodeSize(node: CanvasNode): { width: number; height: number } {
  const fallback = SHAPE_DEFAULT_SIZES[node.data.shape];
  return {
    width: Number(node.style?.width ?? fallback.width),
    height: Number(node.style?.height ?? fallback.height),
  };
}

/**
 * Prepares a template for import alongside `existingNodes`:
 * - assigns fresh, unique ids to every node (and remaps edges) so an import can
 *   never collide with existing ids or a previous import of the same template;
 * - offsets all node positions so the template lands in empty space to the right
 *   of the current content (top-aligned), guaranteeing it never overlaps work
 *   already on the canvas. With an empty canvas the template keeps its own
 *   coordinates.
 */
export function instantiateTemplate(
  template: CanvasTemplate,
  existingNodes: CanvasNode[],
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  // Right edge / top of the existing content, if any.
  let existingMaxX = -Infinity;
  let existingMinY = Infinity;
  for (const node of existingNodes) {
    const { width } = nodeSize(node);
    existingMaxX = Math.max(existingMaxX, node.position.x + width);
    existingMinY = Math.min(existingMinY, node.position.y);
  }

  // Top-left of the template's own layout.
  let templateMinX = Infinity;
  let templateMinY = Infinity;
  for (const node of template.nodes) {
    templateMinX = Math.min(templateMinX, node.position.x);
    templateMinY = Math.min(templateMinY, node.position.y);
  }

  const hasExisting = Number.isFinite(existingMaxX);
  const offsetX = hasExisting ? existingMaxX + IMPORT_GAP - templateMinX : 0;
  const offsetY = hasExisting ? existingMinY - templateMinY : 0;

  const suffix = crypto.randomUUID().slice(0, 8);
  const idMap = new Map(
    template.nodes.map((node) => [node.id, `${template.id}-${node.id}-${suffix}`]),
  );

  const nodes: CanvasNode[] = template.nodes.map((node) => ({
    ...node,
    id: idMap.get(node.id) as string,
    position: { x: node.position.x + offsetX, y: node.position.y + offsetY },
  }));

  const edges: CanvasEdge[] = template.edges.map((edge) => {
    const source = idMap.get(edge.source) as string;
    const target = idMap.get(edge.target) as string;
    return { ...edge, id: `edge-${source}-${target}`, source, target };
  });

  return { nodes, edges };
}

/** Resolves a palette fill by its {@link NODE_COLORS} name (defaults to neutral). */
function fill(name: (typeof NODE_COLORS)[number]["name"]): string {
  return NODE_COLORS.find((color) => color.name === name)?.fill ?? NODE_COLORS[0].fill;
}

/** Builds a template node at a position, sized from {@link SHAPE_DEFAULT_SIZES}. */
function node(
  id: string,
  label: string,
  shape: NodeShape,
  colorName: (typeof NODE_COLORS)[number]["name"],
  x: number,
  y: number,
): CanvasNode {
  return {
    id,
    type: CANVAS_NODE_TYPE,
    position: { x, y },
    data: { label, color: fill(colorName), shape },
    style: SHAPE_DEFAULT_SIZES[shape],
  };
}

/** Builds a template edge (with the standard arrow + light stroke). */
function edge(source: string, target: string, label?: string): CanvasEdge {
  return {
    id: `edge-${source}-${target}`,
    type: CANVAS_EDGE_TYPE,
    source,
    target,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: DEFAULT_EDGE_COLOR,
    },
    style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5, strokeLinecap: "round" },
    data: label ? { label } : {},
  };
}

/**
 * The built-in starter templates. Kept small and readable via the `node`/`edge`
 * helpers above; positions are laid out left-to-right so the diagram previews
 * read as a clear flow.
 */
export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices",
    description:
      "An API gateway fanning out to independent services, each backed by its own database.",
    nodes: [
      node("client", "Client", "circle", "neutral", 0, 120),
      node("gateway", "API Gateway", "rectangle", "blue", 220, 116),
      node("auth", "Auth Service", "pill", "green", 470, 0),
      node("orders", "Orders Service", "pill", "green", 470, 120),
      node("payments", "Payments Service", "pill", "green", 470, 240),
      node("auth-db", "Auth DB", "cylinder", "teal", 720, -4),
      node("orders-db", "Orders DB", "cylinder", "teal", 720, 116),
      node("payments-db", "Payments DB", "cylinder", "teal", 720, 236),
    ],
    edges: [
      edge("client", "gateway"),
      edge("gateway", "auth"),
      edge("gateway", "orders"),
      edge("gateway", "payments"),
      edge("auth", "auth-db"),
      edge("orders", "orders-db"),
      edge("payments", "payments-db"),
    ],
  },
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description:
      "Commit-to-production flow with a test gate that loops failures back to the build.",
    nodes: [
      node("commit", "Commit", "circle", "neutral", 0, 90),
      node("build", "Build", "rectangle", "blue", 210, 96),
      node("test", "Test", "rectangle", "orange", 430, 96),
      node("gate", "Tests Pass?", "diamond", "purple", 650, 90),
      node("staging", "Deploy Staging", "pill", "teal", 880, 0),
      node("prod", "Deploy Prod", "pill", "green", 880, 180),
    ],
    edges: [
      edge("commit", "build"),
      edge("build", "test"),
      edge("test", "gate"),
      edge("gate", "staging", "pass"),
      edge("gate", "build", "fail"),
      edge("staging", "prod", "promote"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description:
      "A producer publishing to an event broker that fans events out to multiple consumers.",
    nodes: [
      node("producer", "Order Service", "rectangle", "blue", 0, 110),
      node("broker", "Event Broker", "hexagon", "orange", 230, 104),
      node("email", "Email Service", "pill", "green", 480, 0),
      node("inventory", "Inventory Service", "pill", "green", 480, 110),
      node("analytics", "Analytics Service", "pill", "green", 480, 220),
      node("store", "Event Store", "cylinder", "teal", 730, 106),
    ],
    edges: [
      edge("producer", "broker", "publish"),
      edge("broker", "email"),
      edge("broker", "inventory"),
      edge("broker", "analytics"),
      edge("broker", "store"),
    ],
  },
];
