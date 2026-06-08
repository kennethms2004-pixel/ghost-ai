"use client";

import { type DragEvent, useCallback, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionMode,
  type DefaultEdgeOptions,
  type EdgeTypes,
  MarkerType,
  MiniMap,
  type NodeTypes,
  type OnConnect,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import {
  CANVAS_EDGE_TYPE,
  CANVAS_NODE_TYPE,
  type CanvasEdge,
  type CanvasNode,
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  NODE_SHAPES,
  type ShapeDragPayload,
  SHAPE_DRAG_MIME,
} from "@/types/canvas";
import { CanvasEdgeView } from "./canvas-edge";
import { CanvasNodeView } from "./canvas-node";
import { EdgeActionsProvider, type EdgeActions } from "./edge-actions";
import { NodeActionsProvider, type NodeActions } from "./node-actions";
import { ShapePanel } from "./shape-panel";

/** Stable node-type map — defined once so React Flow doesn't warn on re-renders. */
const nodeTypes: NodeTypes = { [CANVAS_NODE_TYPE]: CanvasNodeView };

/** Stable edge-type map — defined once so React Flow doesn't warn on re-renders. */
const edgeTypes: EdgeTypes = { [CANVAS_EDGE_TYPE]: CanvasEdgeView };

/**
 * Style applied to every new connection: the custom canvas edge type, a light
 * rounded stroke, and an arrowhead at the target end.
 */
const defaultEdgeOptions: DefaultEdgeOptions = {
  type: CANVAS_EDGE_TYPE,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 18,
    height: 18,
    color: DEFAULT_EDGE_COLOR,
  },
  style: { stroke: DEFAULT_EDGE_COLOR, strokeWidth: 1.5, strokeLinecap: "round" },
};

/**
 * React Flow canvas wired to Liveblocks shared storage. `useLiveblocksFlow`
 * syncs the nodes, edges, and change handlers across every client in the room;
 * with `suspense: true` the surrounding {@link ClientSideSuspense} guarantees
 * `nodes`/`edges` are ready arrays before this renders.
 *
 * Wrapped in {@link ReactFlowProvider} so the drop handler on the canvas wrapper
 * can use `useReactFlow().screenToFlowPosition` to place dropped shapes.
 */
export function FlowCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvasSurface />
    </ReactFlowProvider>
  );
}

function FlowCanvasSurface() {
  // `onConnect` is intentionally NOT taken from the hook: its built-in handler
  // adds a plain default edge and ignores `defaultEdgeOptions`, so new
  // connections would render without the custom edge type or arrow. We build a
  // fully-typed edge ourselves below and route it through `onEdgesChange` (the
  // same Liveblocks write path) instead.
  const { nodes, edges, onNodesChange, onEdgesChange, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      nodes: { initial: [] },
      edges: { initial: [] },
      suspense: true,
    });

  const { screenToFlowPosition, getNode, getEdge } =
    useReactFlow<CanvasNode, CanvasEdge>();

  // Edge hover/editing state lives here so the custom edge renderer can react to
  // it through the EdgeActions context.
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);

  // Edge-label edits routed through `onEdgesChange` (the Liveblocks write path)
  // so labels sync to every client in the room — mirrors `nodeActions`.
  const edgeActions = useMemo<EdgeActions>(
    () => ({
      hoveredEdgeId,
      editingEdgeId,
      setEditingEdgeId,
      updateEdgeLabel: (id, label) => {
        const edge = getEdge(id);
        if (!edge) return;
        onEdgesChange([
          { type: "replace", id, item: { ...edge, data: { ...edge.data, label } } },
        ]);
      },
    }),
    [hoveredEdgeId, editingEdgeId, getEdge, onEdgesChange],
  );

  // Node-level mutations routed through `onNodesChange` (the Liveblocks write
  // path) so edits made from inside a node sync to every client in the room.
  const nodeActions = useMemo<NodeActions>(
    () => ({
      updateNodeLabel: (id, label) => {
        const node = getNode(id);
        if (!node) return;
        onNodesChange([
          { type: "replace", id, item: { ...node, data: { ...node.data, label } } },
        ]);
      },
      updateNodeColor: (id, color) => {
        const node = getNode(id);
        if (!node) return;
        onNodesChange([
          { type: "replace", id, item: { ...node, data: { ...node.data, color } } },
        ]);
      },
    }),
    [getNode, onNodesChange],
  );

  // Build new connections as custom canvas edges (with the arrow + light stroke
  // from `defaultEdgeOptions`) and add them through `onEdgesChange` so they sync
  // through Liveblocks. The deterministic id (keyed on the connected handles)
  // means re-connecting the same handles overwrites rather than duplicates.
  const onConnect = useCallback<OnConnect>(
    (connection: Connection) => {
      const edge: CanvasEdge = {
        ...defaultEdgeOptions,
        id: `edge-${connection.source}${connection.sourceHandle ?? ""}-${connection.target}${connection.targetHandle ?? ""}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: CANVAS_EDGE_TYPE,
        data: {},
      };
      onEdgesChange([{ type: "add", item: edge }]);
    },
    [onEdgesChange],
  );

  /** Whether a shape is currently being dragged over the canvas. */
  const [isDropActive, setIsDropActive] = useState(false);

  const onDragOver = useCallback((event: DragEvent) => {
    if (!event.dataTransfer.types.includes(SHAPE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDropActive(true);
  }, []);

  const onDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    // Only clear when the pointer actually leaves the wrapper, not when it
    // crosses onto a child element inside it.
    if (!event.currentTarget.contains(event.relatedTarget as globalThis.Node | null)) {
      setIsDropActive(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setIsDropActive(false);

      const raw = event.dataTransfer.getData(SHAPE_DRAG_MIME);
      if (!raw) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw) as ShapeDragPayload;
      } catch {
        return;
      }
      if (!NODE_SHAPES.includes(payload.shape)) return;

      const { width, height } = payload.size;
      const cursor = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      // Center the node on the cursor so it lands where the user released.
      const position = { x: cursor.x - width / 2, y: cursor.y - height / 2 };

      const newNode: CanvasNode = {
        // A random UUID keeps ids globally unique across collaborators —
        // a timestamp + per-client counter can collide between clients.
        id: `${payload.shape}-${crypto.randomUUID()}`,
        type: CANVAS_NODE_TYPE,
        position,
        data: { label: "", color: DEFAULT_NODE_COLOR, shape: payload.shape },
        style: { width, height },
      };

      onNodesChange([{ type: "add", item: newNode }]);
    },
    [screenToFlowPosition, onNodesChange],
  );

  return (
    <NodeActionsProvider value={nodeActions}>
      <EdgeActionsProvider value={edgeActions}>
      <div
        className="relative h-full w-full"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDelete={onDelete}
          onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
          onEdgeMouseLeave={() => setHoveredEdgeId(null)}
          onEdgeDoubleClick={(_, edge) => setEditingEdgeId(edge.id)}
          connectionMode={ConnectionMode.Loose}
          colorMode="dark"
          fitView
          style={{ background: "transparent" }}
        >
          <Background variant={BackgroundVariant.Dots} />
          <MiniMap />
        </ReactFlow>

        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 rounded-lg ring-2 ring-inset ring-brand/50 transition-opacity duration-200",
            isDropActive ? "opacity-100" : "opacity-0",
          )}
        />

        <ShapePanel />
      </div>
      </EdgeActionsProvider>
    </NodeActionsProvider>
  );
}
