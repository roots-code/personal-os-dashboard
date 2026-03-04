"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyActivityChart() {
  const data = {
    labels,
    datasets: [
      {
        label: "Tasks",
        data: [3, 5, 4, 6, 5, 2, 1],
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Workouts",
        data: [1, 0, 1, 0, 1, 1, 0],
        borderColor: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.18)",
        tension: 0.4,
        fill: true
      },
      {
        label: "Habits",
        data: [3, 4, 4, 5, 4, 3, 2],
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.18)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: "index" as const,
        intersect: false
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#9ca3af",
          font: { size: 10 }
        },
        grid: {
          display: false
        }
      },
      y: {
        ticks: {
          color: "#6b7280",
          font: { size: 9 },
          stepSize: 2
        },
        grid: {
          color: "rgba(55, 65, 81, 0.5)"
        }
      }
    }
  };

  return (
    <div className="h-40">
      <Line data={data} options={options} />
    </div>
  );
}

