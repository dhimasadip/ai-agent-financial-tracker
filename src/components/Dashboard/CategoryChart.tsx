"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useTheme } from "@/contexts/ThemeContext";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryChartProps {
  data: { category: string; amount: number; color: string }[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = {
    labels: data.map((d) => d.category),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((d) => d.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: isDark ? "#a1a1aa" : "#71717a",
          usePointStyle: true,
          padding: 16,
          font: {
            size: 11,
          },
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
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            const formattedValue = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(value);
            return ` ${formattedValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-secondary rounded-xl p-4 border border-border">
      <h3 className="text-sm font-semibold text-text mb-4">Spending by Category</h3>
      <div className="h-[200px]">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}

// Helper to get category breakdown from transactions
export function getCategoryBreakdown(
  transactions: { type: string; amount: number; category: string }[]
) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const categoryMap = new Map<string, number>();

  const categoryColors: Record<string, string> = {
    "Food & Dining": "#f59e0b",
    "Transport": "#3b82f6",
    "Health": "#ec4899",
    "Entertainment": "#8b5cf6",
    "Utilities": "#6366f1",
    "Shopping": "#f43f5e",
    "Other": "#71717a",
  };

  expenseTransactions.forEach((t) => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  return Array.from(categoryMap.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      color: categoryColors[category] || "#71717a",
    }))
    .sort((a, b) => b.amount - a.amount);
}