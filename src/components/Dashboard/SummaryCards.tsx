"use client";

import React from "react";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  iconBgClass: string;
}

export function SummaryCard({ title, value, change, icon, iconBgClass }: SummaryCardProps) {
  return (
    <div className="bg-secondary rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted font-medium uppercase tracking-wide">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg", iconBgClass)}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-text">{value}</span>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              change >= 0 ? "text-success" : "text-danger"
            )}
          >
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  incomeChange?: number;
  expenseChange?: number;
  savingsChange?: number;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  netSavings,
  incomeChange,
  expenseChange,
  savingsChange,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Income"
        value={formatCurrency(totalIncome)}
        change={incomeChange}
        icon={<DollarSign className="w-4 h-4 text-success" />}
        iconBgClass="bg-success/10"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(totalExpenses)}
        change={expenseChange}
        icon={<TrendingDown className="w-4 h-4 text-danger" />}
        iconBgClass="bg-danger/10"
      />
      <SummaryCard
        title="Net Savings"
        value={formatCurrency(netSavings)}
        change={savingsChange}
        icon={<TrendingUp className="w-4 h-4 text-accent" />}
        iconBgClass="bg-accent/10"
      />
    </div>
  );
}