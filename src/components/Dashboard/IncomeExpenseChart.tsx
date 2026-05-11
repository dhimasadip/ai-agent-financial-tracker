"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IncomeExpenseChartProps {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
}

export function IncomeExpenseChart({
  labels,
  incomeData,
  expenseData,
}: IncomeExpenseChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: incomeData,
        backgroundColor: "#22c55e",
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: "Expenses",
        data: expenseData,
        backgroundColor: "#ef4444",
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: isDark ? "#a1a1aa" : "#71717a",
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "#27272a" : "#ffffff",
        titleColor: isDark ? "#fafafa" : "#09090b",
        bodyColor: isDark ? "#a1a1aa" : "#71717a",
        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? "#a1a1aa" : "#71717a",
        },
      },
      y: {
        grid: {
          color: isDark ? "#27272a" : "#e4e4e7",
        },
        ticks: {
          color: isDark ? "#a1a1aa" : "#71717a",
        },
      },
    },
  };

  return (
    <div className="bg-secondary rounded-xl p-4 border border-border">
      <h3 className="text-sm font-semibold text-text mb-4">Income vs Expenses</h3>
      <div className="h-[200px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

// Helper function to generate period labels
export function getPeriodLabels(period: "week" | "month" | "year"): string[] {
  switch (period) {
    case "week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "month":
      return ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
    case "year":
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    default:
      return [];
  }
}

// Helper to get mock data for charts
export function getChartData(
  period: "week" | "month" | "year",
  transactions: { type: string; amount: number; date: string }[]
) {
  const labels = getPeriodLabels(period);
  const incomeData = new Array(labels.length).fill(0);
  const expenseData = new Array(labels.length).fill(0);

  // For demo purposes, distribute mock data across periods
  const baseIncome = period === "week" ? 1500 : period === "month" ? 6000 : 72000;
  const baseExpense = period === "week" ? 800 : period === "month" ? 3000 : 36000;

  labels.forEach((_, i) => {
    incomeData[i] = Math.round((Math.random() * 0.4 + 0.8) * baseIncome / labels.length);
    expenseData[i] = Math.round((Math.random() * 0.4 + 0.6) * baseExpense / labels.length);
  });

  return { labels, incomeData, expenseData };
}