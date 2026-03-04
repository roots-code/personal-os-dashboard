import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal OS Dashboard",
  description: "A personal productivity and fitness operating system"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-50">
        <div className="min-h-screen flex">
          <aside className="hidden md:flex w-72 flex-col border-r border-border/70 bg-surface">
            <div className="px-6 py-5 border-b border-border/70 flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-emerald-500" />
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Personal OS
                </p>
                <p className="text-xs text-slate-400">Productivity & Fitness</p>
              </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2 text-sm text-slate-300">
              <a href="/dashboard" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Dashboard
              </a>
              <a href="/tasks" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Tasks
              </a>
              <a href="/workouts" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Workouts
              </a>
              <a href="/habits" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Habits
              </a>
              <a href="/analytics" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Analytics
              </a>
              <a href="/settings" className="block px-3 py-2 rounded-lg hover:bg-surfaceMuted">
                Settings
              </a>
            </nav>
          </aside>
          <main className="flex-1 min-w-0">
            <header className="md:hidden sticky top-0 z-20 border-b border-border/70 bg-surface/95 backdrop-blur">
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-accent to-emerald-500" />
                  <span className="text-sm font-semibold">Personal OS</span>
                </div>
              </div>
            </header>
            <div className="px-4 md:px-8 py-6 md:py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
