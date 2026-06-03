export default function EditorPage() {
  return (
    <main className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold text-copy-primary">
        Your workspace
      </h1>
      <p className="text-sm text-copy-muted">
        Open a project from the sidebar to start designing.
      </p>
    </main>
  );
}
