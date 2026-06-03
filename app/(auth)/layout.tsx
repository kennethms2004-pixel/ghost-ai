import { Ghost } from "lucide-react";

const features = [
  "Describe a system in plain English",
  "AI maps it onto a shared canvas",
  "Refine the architecture together in real time",
  "Generate a Markdown technical spec",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-base">
      {/* Left panel — hidden on small screens */}
      <aside className="hidden lg:flex lg:w-1/2 flex-col justify-center gap-10 border-r border-surface-border px-16">
        <div className="flex items-center gap-2">
          <Ghost className="h-5 w-5 text-brand" />
          <span className="text-lg font-semibold text-copy-primary">
            Ghost AI
          </span>
        </div>

        <p className="max-w-sm text-sm text-copy-secondary">
          Real-time collaborative system design workspace.
        </p>

        <ul className="flex flex-col gap-3">
          {features.map((feature) => (
            <li key={feature} className="text-sm text-copy-muted">
              {feature}
            </li>
          ))}
        </ul>
      </aside>

      {/* Right panel — centered Clerk form */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
