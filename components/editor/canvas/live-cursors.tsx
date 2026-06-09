"use client";

import { useViewport } from "@xyflow/react";
import { shallow } from "@liveblocks/react";
import { useOthersMapped } from "@liveblocks/react/suspense";

/**
 * Live collaborator cursors drawn on top of the canvas. Cursors are broadcast in
 * flow coordinates (see `flow-canvas.tsx`), so this overlay applies the current
 * React Flow viewport transform — the same `translate(...) scale(...)` React Flow
 * uses for nodes — to keep every cursor pinned to canvas content regardless of
 * each viewer's pan/zoom. The pointer + badge are counter-scaled so they stay a
 * constant size at any zoom level.
 *
 * Only other participants are rendered; the current user never sees their own
 * cursor here (the local pointer is the real mouse). `useOthers` excludes the
 * current connection, and entries without a cursor are skipped.
 */
export function LiveCursors() {
  const { x, y, zoom } = useViewport();
  const others = useOthersMapped(
    (other) => ({
      cursor: other.presence.cursor,
      name: other.info?.name ?? "",
      color: other.info?.color ?? "#808090",
    }),
    shallow,
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {others.map(([connectionId, { cursor, name, color }]) => {
          if (!cursor) return null;
          return (
            <div
              key={connectionId}
              className="absolute left-0 top-0"
              style={{
                transform: `translate(${cursor.x}px, ${cursor.y}px) scale(${1 / zoom})`,
                transformOrigin: "0 0",
              }}
            >
              <Cursor color={color} name={name} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A small colored pointer with the participant's name badge attached. */
function Cursor({ color, name }: { color: string; name: string }) {
  return (
    <div className="flex items-start">
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="shrink-0 drop-shadow"
        aria-hidden
      >
        <path
          d="M2 2L7 16L9.5 9.5L16 7L2 2Z"
          fill={color}
          stroke="#0b0b0d"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
      {name && (
        <span
          className="ml-0.5 mt-3 max-w-[10rem] truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none text-white"
          style={{ backgroundColor: color }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
