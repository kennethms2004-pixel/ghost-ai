import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI",
  description: "Real-time collaborative system design workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      appearance={{
        theme: dark,
        // Map Clerk's appearance variables onto the app's CSS custom properties
        // so auth UI inherits the dark workspace palette. No hardcoded colors.
        variables: {
          colorPrimary: "var(--accent-primary)",
          colorPrimaryForeground: "var(--bg-base)",
          colorBackground: "var(--bg-surface)",
          colorForeground: "var(--text-primary)",
          colorInput: "var(--bg-elevated)",
          colorInputForeground: "var(--text-primary)",
          colorMuted: "var(--bg-subtle)",
          colorMutedForeground: "var(--text-muted)",
          colorBorder: "var(--border-default)",
          colorNeutral: "var(--text-primary)",
          colorDanger: "var(--state-error)",
          colorSuccess: "var(--state-success)",
          colorWarning: "var(--state-warning)",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-geist-sans)",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-base">{children}</body>
      </html>
    </ClerkProvider>
  );
}
