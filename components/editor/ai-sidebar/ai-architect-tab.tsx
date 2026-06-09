"use client";

import { useRef, useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
] as const;

const TEXTAREA_MIN_HEIGHT = 72;
const TEXTAREA_MAX_HEIGHT = 160;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * AI Architect tab: a scrollable chat surface with an empty state + starter
 * prompts and an auto-resizing input. UI only — no AI generation yet, so
 * sending simply appends the user's message locally.
 */
export function AiArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function resizeTextarea(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(
      Math.max(el.scrollHeight, TEXTAREA_MIN_HEIGHT),
      TEXTAREA_MAX_HEIGHT,
    )}px`;
  }

  function send() {
    const content = input.trim();
    if (!content) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setInput("");
    const el = textareaRef.current;
    if (el) {
      el.style.height = `${TEXTAREA_MIN_HEIGHT}px`;
    }
  }

  function applyStarterPrompt(prompt: string) {
    setInput(prompt);
    const el = textareaRef.current;
    if (el) {
      el.focus();
      // Defer so the value is in the DOM before measuring.
      requestAnimationFrame(() => resizeTextarea(el));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle">
                <Bot className="h-6 w-6 text-ai-text" />
              </div>
              <p className="max-w-[15rem] text-sm text-copy-muted">
                Describe the system you want to build and Ghost AI will help you
                architect it on the canvas.
              </p>
              <div className="flex flex-col gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => applyStarterPrompt(prompt)}
                    className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-ai-text transition-colors hover:bg-elevated"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "self-end border-2 border-brand/50 bg-accent-dim text-copy-primary"
                    : "self-start border border-surface-border bg-elevated text-ai-text",
                )}
              >
                {message.content}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-surface-border p-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeTextarea(e.currentTarget);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Describe what you want to build…"
            style={{
              minHeight: TEXTAREA_MIN_HEIGHT,
              maxHeight: TEXTAREA_MAX_HEIGHT,
            }}
            className="resize-none pr-12"
          />
          <Button
            type="button"
            size="icon"
            onClick={send}
            disabled={!input.trim()}
            aria-label="Send message"
            className="absolute bottom-2 right-2 h-8 w-8 bg-ai text-white hover:bg-ai/90"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
