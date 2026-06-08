import type { ComponentProps } from "react";
import type { SignIn } from "@clerk/nextjs";

type ClerkAppearance = NonNullable<
  ComponentProps<typeof SignIn>["appearance"]
>;

/**
 * Blends Clerk's auth card into the (auth) two-panel layout. The right panel
 * already provides the frame and each page supplies its own heading, so the
 * card is flattened — borderless, shadowless, transparent — and Clerk's built-in
 * header is hidden. Colors and typography still come from the dark theme +
 * variable mapping on ClerkProvider (app/layout.tsx); this only strips the
 * standalone-card chrome.
 */
export const authAppearance: ClerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full border-none shadow-none",
    card: "bg-transparent border-none shadow-none",
    header: "hidden",
    footer: "bg-transparent",
  },
};
