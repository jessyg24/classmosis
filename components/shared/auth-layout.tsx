export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cm-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-cm-title text-cm-text-primary">Classmosis</h1>
          <p className="text-cm-body text-cm-text-secondary mt-1">
            Where learning flows
          </p>
        </div>
        <div className="bg-cm-surface rounded-cm-modal border border-cm-border p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
