"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates";
import { StarterTemplatePreview } from "./starter-template-preview";

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the chosen template; the modal closes itself afterwards. */
  onImport: (template: CanvasTemplate) => void;
}

/**
 * Dialog listing the built-in starter templates as a scrollable grid of cards.
 * Each card shows a lightweight diagram preview, the template name/description,
 * and an import button. Choosing a template calls {@link onImport} and closes.
 *
 * The content is a flex column with a hard `max-h`: the header stays fixed and
 * the card grid scrolls inside a `flex-1 min-h-0` region, so the dialog never
 * grows past the viewport.
 */
export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="shrink-0 border-b border-surface-border p-5">
          <DialogTitle>Start from a template</DialogTitle>
          <DialogDescription>
            Import a pre-built diagram. It&apos;s added to your canvas next to any
            existing work, never on top of it.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface p-3 transition-colors hover:border-brand/50"
              >
                <div className="h-36 w-full overflow-hidden rounded-lg border border-surface-border bg-base">
                  <StarterTemplatePreview template={template} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-copy-primary">
                    {template.name}
                  </h3>
                  <p className="text-xs leading-relaxed text-copy-muted">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="mt-auto"
                  onClick={() => handleImport(template)}
                >
                  Import
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
