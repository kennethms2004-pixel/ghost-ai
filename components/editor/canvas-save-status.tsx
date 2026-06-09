"use client";

import { AlertTriangle, Check, Loader2, Save } from "lucide-react";
import { useCanvasSaveStatus } from "./canvas-save-status-context";

/**
 * Clickable Save button for the navbar. Reflects the canvas autosave lifecycle
 * (idle/saving/saved/error) bridged up via {@link useCanvasSaveStatus}, and on
 * click triggers an immediate, real save of the current canvas. Autosave still
 * runs in the background; this just lets the user force a save on demand.
 */
export function CanvasSaveStatus() {
  const { status, save, canSave } = useCanvasSaveStatus();

  const config = {
    idle: { Icon: Save, label: "Save", className: "text-copy-secondary" },
    saving: { Icon: Loader2, label: "Saving…", className: "text-copy-muted" },
    saved: { Icon: Check, label: "Saved", className: "text-success" },
    error: {
      Icon: AlertTriangle,
      label: "Save failed",
      className: "text-error",
    },
  }[status];

  const { Icon, label, className } = config;
  const disabled = !canSave || status === "saving";

  return (
    <button
      type="button"
      onClick={save}
      disabled={disabled}
      aria-label="Save canvas"
      title="Save canvas"
      className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors hover:bg-elevated disabled:pointer-events-none disabled:opacity-60 ${className}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === "saving" ? "animate-spin" : ""}`} />
      <span>{label}</span>
    </button>
  );
}
