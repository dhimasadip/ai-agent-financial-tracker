"use client";

import React from "react";
import { useTransactions, Period } from "@/contexts/TransactionContext";
import { SummaryCards } from "./SummaryCards";
import { IncomeExpenseChart, getChartData } from "./IncomeExpenseChart";
import { CategoryChart, getCategoryBreakdown } from "./CategoryChart";
import { TransactionTable } from "./TransactionTable";
import { PeriodSelector } from "./PeriodSelector";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { transactions, period, setPeriod, getMetrics } = useTransactions();
  const metrics = getMetrics();

  const chartData = getChartData(period, transactions);
  const categoryData = getCategoryBreakdown(transactions);

  // Get Finn's proactive insight
  const getInsight = () => {
    if (metrics.netSavings > 0) {
      const savingsRate = (metrics.netSavings / metrics.totalIncome) * 100;
      if (savingsRate >= 20) {
        return "Great savings rate! You're on track to hit your financial goals.";
      } else if (savingsRate >= 10) {
        return "Good start! Try reducing dining expenses to boost your savings rate to 20%.";
      }
    }
    return "Tip: Track every expense to understand your spending patterns better.";
  };

  return (
    <div className="flex flex-col h-full bg-primary overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-xl font-bold text-text">Financial Dashboard</h1>
          <p className="text-sm text-muted">Track your money, reach your goals</p>
        </div>
        <PeriodSelector period={period} onPeriodChange={setPeriod} />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* AI Insight Strip */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border",
          "bg-accent/5 border-accent/20"
        )}>
          <div className="p-2 rounded-lg bg-accent/10">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-accent uppercase tracking-wide">AI Insight</p>
            <p className="text-sm text-text">{getInsight()}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards
          totalIncome={metrics.totalIncome}
          totalExpenses={metrics.totalExpenses}
          netSavings={metrics.netSavings}
          incomeChange={12}
          expenseChange={-5}
          savingsChange={8}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncomeExpenseChart
            labels={chartData.labels}
            incomeData={chartData.incomeData}
            expenseData={chartData.expenseData}
          />
          <CategoryChart data={categoryData} />
        </div>

        {/* Transaction Table */}
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}