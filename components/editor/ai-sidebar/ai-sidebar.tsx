"use client";

import { useEffect, useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AiArchitectTab } from "./ai-architect-tab";
import { SpecsTab } from "./specs-tab";

interface AiSidebarProps {
  /** Open/close state, owned by the parent (the AI-sidebar context connector). */
  isOpen: boolean;
  onClose: () => void;
}

const triggerClassName = cn(
  "flex-1 text-copy-muted",
  "data-active:bg-ai/10 data-active:text-ai-text",
);

/**
 * Floating, slide-in AI workspace sidebar. Open/close is fully controlled by the
 * parent. UI only — no AI/Liveblocks logic.
 *
 * The panel animates in on open and out on close, then **fully unmounts** once
 * the slide-out transition ends. Keeping a closed panel mounted (even off-screen
 * with `pointer-events-none`) left a compositor layer in Chrome that swallowed
 * clicks over the right edge of the canvas — the "dead zone after closing" bug.
 * Unmounting removes the element entirely, so there is nothing left to intercept.
 */
export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  // `mounted` = present in the DOM (true while open and during the slide-out).
  // `entered` = at the on-screen position (drives the transform for the slide).
  const [mounted, setMounted] = useState(isOpen);
  const [entered, setEntered] = useState(isOpen);

  // Drive the enter/exit transitions. All setState happens inside rAF callbacks
  // (not synchronously in the effect body) so it animates across a frame.
  useEffect(() => {
    let rafEnter = 0;
    let rafMount = 0;
    if (isOpen) {
      rafMount = requestAnimationFrame(() => {
        setMounted(true);
        // Mount at the off-screen position first, then flip on the next frame so
        // the browser has a "from" state to animate the slide-in from.
        rafEnter = requestAnimationFrame(() => setEntered(true));
      });
    } else {
      rafEnter = requestAnimationFrame(() => setEntered(false));
    }
    return () => {
      cancelAnimationFrame(rafMount);
      cancelAnimationFrame(rafEnter);
    };
  }, [isOpen]);

  // Escape closes the panel while it's open.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <aside
      aria-label="AI Workspace"
      aria-hidden={!isOpen}
      // Once the slide-out finishes, unmount so no off-screen layer remains to
      // intercept clicks. Guarded to this element's own transform transition so a
      // child's transition (e.g. a button hover) can't unmount it early.
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === "transform" &&
          !isOpen
        ) {
          setMounted(false);
        }
      }}
      className={cn(
        "fixed right-0 top-12 z-50 flex h-[calc(100vh-3rem)] w-[340px] flex-col",
        // Solid surface (no backdrop-blur): a backdrop-filter element also leaves
        // a frozen repaint ghost in Chrome when it slides off-screen.
        "border-l border-surface-border bg-surface shadow-2xl",
        "transition-transform duration-300 ease-out",
        entered ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-border px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-subtle">
          <Bot className="h-4 w-4 text-ai-text" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-copy-primary">
            AI Workspace
          </p>
          <p className="truncate text-xs text-copy-muted">
            Collaborate with Ghost AI
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close AI Workspace"
          className="h-8 w-8 shrink-0 text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="architect"
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="px-3 pt-3">
          <TabsList className="w-full bg-subtle">
            <TabsTrigger value="architect" className={triggerClassName}>
              AI Architect
            </TabsTrigger>
            <TabsTrigger value="specs" className={triggerClassName}>
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="architect"
          className="flex min-h-0 flex-1 flex-col data-[hidden]:hidden"
        >
          <AiArchitectTab />
        </TabsContent>
        <TabsContent
          value="specs"
          className="flex min-h-0 flex-1 flex-col data-[hidden]:hidden"
        >
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
