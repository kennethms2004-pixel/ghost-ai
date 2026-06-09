"use client";

import { Download, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Specs tab: a "Generate Spec" action plus a static demo spec card. UI only —
 * no generation or download wiring yet (download is intentionally disabled).
 */
export function SpecsTab() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-surface-border p-3">
        <Button
          type="button"
          className="w-full bg-ai text-white hover:bg-ai/90"
        >
          <Sparkles className="h-4 w-4" />
          Generate Spec
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-2xl border border-surface-border bg-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-subtle">
                <FileText className="h-4 w-4 text-ai-text" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-medium text-copy-primary">
                  System Design Spec
                </h4>
                <p className="mt-1 line-clamp-3 text-xs text-copy-muted">
                  A structured breakdown of services, data stores, and the
                  connections between them — generated from your canvas to keep
                  documentation in sync with the design.
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled
                aria-label="Download spec"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
