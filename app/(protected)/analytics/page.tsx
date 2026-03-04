"use client";

import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Visualize workout frequency, habit completion, and task throughput.
        </p>
      </header>
      <AnalyticsCharts />
    </div>
  );
}

