"use client";

import React from "react";
import { Transaction } from "@/contexts/TransactionContext";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Salary": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      "Freelance": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      "Food & Dining": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      "Transport": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "Health": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
      "Entertainment": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
      "Utilities": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      "Shopping": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      "Other": "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[category] || colors["Other"];
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-secondary rounded-xl p-8 border border-border text-center">
        <p className="text-muted">No transactions yet</p>
        <p className="text-sm text-muted mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-secondary rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted uppercase tracking-wide border-b border-border">
              <th className="text-left px-4 py-3">Description</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
              <th className="text-right px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.slice(0, 10).map((transaction) => (
              <tr key={transaction.id} className="hover:bg-tertiary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        transaction.type === "income"
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-text">{transaction.description}</span>
                      <span className="ml-2 text-xs text-muted sm:hidden">{formatDate(transaction.date)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={cn(
                      "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                      getCategoryColor(transaction.category)
                    )}
                  >
                    {transaction.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted hidden md:table-cell">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      transaction.type === "income" ? "text-success" : "text-danger"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}