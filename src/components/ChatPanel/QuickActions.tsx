"use client";

import React from "react";
import { Sparkles, TrendingUp, PiggyBank, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  query: string;
}

const quickActions: QuickAction[] = [
  {
    id: "spending",
    label: "Spending Summary",
    icon: <BarChart3 className="w-4 h-4" />,
    query: "Give me a spending summary",
  },
  {
    id: "savings",
    label: "Savings Tips",
    icon: <PiggyBank className="w-4 h-4" />,
    query: "How can I save more?",
  },
  {
    id: "budget",
    label: "Budget Check",
    icon: <TrendingUp className="w-4 h-4" />,
    query: "Check my budget status",
  },
  {
    id: "top",
    label: "Top Expenses",
    icon: <Sparkles className="w-4 h-4" />,
    query: "What are my top expenses?",
  },
];

interface QuickActionsProps {
  onAction: (query: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.query)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
            "bg-secondary text-text border border-border",
            "hover:bg-tertiary hover:border-accent/30",
            "transition-colors"
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}