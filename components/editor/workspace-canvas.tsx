import { CanvasRoom } from "./canvas/canvas-room";

/**
 * Central canvas area. Hosts the collaborative React Flow canvas for the project
 * room (room id === project id). Sits on the base background; React Flow fills
 * the area and draws its own dot-pattern background on top.
 */
export function WorkspaceCanvas({ roomId }: { roomId: string }) {
  return (
    <div className="relative min-w-0 flex-1 bg-base">
      <CanvasRoom roomId={roomId} />
    </div>
  );
}
