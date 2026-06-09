"use client";

import { Maximize, Redo2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface ControlButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ControlButton({ onClick, label, disabled, children }: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition-all duration-150",
        "hover:bg-elevated hover:text-copy-primary",
        "disabled:pointer-events-none disabled:opacity-30",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Floating pill-shaped control bar at the bottom-left of the canvas. Holds two
 * groups separated by a thin divider: zoom controls (out / fit / in) wired to
 * the React Flow instance, and history controls (undo / redo) wired to
 * Liveblocks history. Disabled history buttons stay visually dimmed.
 */
export function CanvasControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: CanvasControlsProps) {
  return (
    <div className="absolute bottom-6 left-6 z-10">
      <div className="flex items-center gap-1 rounded-full border border-surface-border bg-surface/90 p-1.5 shadow-lg backdrop-blur">
        <ControlButton onClick={onZoomOut} label="Zoom out">
          <ZoomOut className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={onFitView} label="Fit view">
          <Maximize className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={onZoomIn} label="Zoom in">
          <ZoomIn className="h-5 w-5" />
        </ControlButton>

        <div className="mx-1 h-5 w-px bg-surface-border" aria-hidden />

        <ControlButton onClick={onUndo} label="Undo" disabled={!canUndo}>
          <Undo2 className="h-5 w-5" />
        </ControlButton>
        <ControlButton onClick={onRedo} label="Redo" disabled={!canRedo}>
          <Redo2 className="h-5 w-5" />
        </ControlButton>
      </div>
    </div>
  );
}
