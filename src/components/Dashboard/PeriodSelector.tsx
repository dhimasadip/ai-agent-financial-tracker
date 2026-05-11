"use client";

import React from "react";
import { Period } from "@/contexts/TransactionContext";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface PeriodSelectorProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-secondary rounded-lg p-1 border border-border">
      <Calendar className="w-4 h-4 text-muted ml-2" />
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            period === p.value
              ? "bg-accent text-white"
              : "text-muted hover:text-text hover:bg-tertiary"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}