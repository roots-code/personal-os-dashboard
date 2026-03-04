import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardCard({
  title,
  description,
  actions,
  children
}: DashboardCardProps) {
  return (
    <section className="glass-panel p-4 md:p-5 flex flex-col gap-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <div className="flex-1 min-h-[60px]">{children}</div>
    </section>
  );
}

