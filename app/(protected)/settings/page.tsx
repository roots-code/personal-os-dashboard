export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Configure your Personal OS preferences.
        </p>
      </header>
      <div className="glass-panel p-4 space-y-4 text-xs md:text-sm">
        <section>
          <h2 className="text-sm font-semibold mb-1">Theme</h2>
          <p className="text-slate-400">
            The app is optimized for a dark, minimal dashboard aesthetic inspired by
            Notion and Linear.
          </p>
        </section>
        <section>
          <h2 className="text-sm font-semibold mb-1">Account</h2>
          <p className="text-slate-400">
            Authentication is handled by Supabase email (magic link). Manage users
            and security policies from the Supabase dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}

