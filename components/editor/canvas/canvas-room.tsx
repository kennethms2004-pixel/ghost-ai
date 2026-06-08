"use client";

import { Component, type ReactNode } from "react";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { Loader2, TriangleAlert } from "lucide-react";
import { FlowCanvas } from "./flow-canvas";

/**
 * Client-side Liveblocks room for a single project's canvas. The room id is the
 * project id; the browser authenticates against `/api/liveblocks-auth`, which
 * issues a session token only after verifying project membership (the secret
 * never reaches the client). Initial presence starts with no cursor.
 */
export function CanvasRoom({ roomId }: { roomId: string }) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        <CanvasErrorBoundary>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <FlowCanvas />
          </ClientSideSuspense>
        </CanvasErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function CanvasLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-2 text-copy-muted">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Connecting to canvas…</span>
    </div>
  );
}

function CanvasConnectionError() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
      <TriangleAlert className="h-8 w-8 text-error" />
      <p className="text-sm text-copy-primary">Couldn&apos;t connect to the canvas</p>
      <p className="text-xs text-copy-faint">
        Check your connection and reload the page to try again.
      </p>
    </div>
  );
}

/**
 * Catches Liveblocks connection/storage errors thrown beneath the room so a
 * failed realtime connection renders a fallback instead of crashing the editor.
 */
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <CanvasConnectionError />;
    return this.props.children;
  }
}
