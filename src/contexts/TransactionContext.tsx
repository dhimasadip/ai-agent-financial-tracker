"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "finn";
  content: string;
  timestamp: Date;
}

export type Period = "week" | "month" | "year";

interface TransactionContextType {
  transactions: Transaction[];
  chatMessages: ChatMessage[];
  period: Period;
  isInitialized: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setPeriod: (period: Period) => void;
  getMetrics: () => {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  };
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

// System categories from PRD
export const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Salary", type: "income", color: "#22c55e", icon: "wallet" },
  { id: "2", name: "Freelance", type: "income", color: "#10b981", icon: "briefcase" },
  { id: "3", name: "Food & Dining", type: "expense", color: "#f59e0b", icon: "utensils" },
  { id: "4", name: "Transport", type: "expense", color: "#3b82f6", icon: "car" },
  { id: "5", name: "Health", type: "expense", color: "#ec4899", icon: "heart" },
  { id: "6", name: "Entertainment", type: "expense", color: "#8b5cf6", icon: "film" },
  { id: "7", name: "Utilities", type: "expense", color: "#6366f1", icon: "zap" },
  { id: "8", name: "Shopping", type: "expense", color: "#f43f5e", icon: "shopping-bag" },
  { id: "9", name: "Other", type: "expense", color: "#71717a", icon: "circle" },
];

// Stable initial data - timestamps set after mount to avoid hydration mismatch
// Amounts in Indonesian Rupiah (IDR)
const mockTransactions: Transaction[] = [
  { id: "1", type: "income", description: "Gaji Bulanan", amount: 15000000, category: "Salary", date: "2026-05-01" },
  { id: "2", type: "income", description: "Proyek Freelance", amount: 3000000, category: "Freelance", date: "2026-05-03" },
  { id: "3", type: "expense", description: "Belanja Groceries", amount: 500000, category: "Food & Dining", date: "2026-05-04" },
  { id: "4", type: "expense", description: "Bensin Motor", amount: 200000, category: "Transport", date: "2026-05-04" },
  { id: "5", type: "expense", description: "Langganan Netflix", amount: 259000, category: "Entertainment", date: "2026-05-05" },
  { id: "6", type: "expense", description: "Tagihan Listrik", amount: 500000, category: "Utilities", date: "2026-05-06" },
  { id: "7", type: "expense", description: "Membership Gym", amount: 300000, category: "Health", date: "2026-05-07" },
  { id: "8", type: "expense", description: "Makan di Restoran", amount: 150000, category: "Food & Dining", date: "2026-05-07" },
  { id: "9", type: "expense", description: "Belanja Online", amount: 500000, category: "Shopping", date: "2026-05-08" },
];

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize chat messages after mount to avoid hydration mismatch
  useEffect(() => {
    setChatMessages([
      {
        id: "1",
        role: "finn",
        content: "Halo! Aku Finn, asisten keuanganmu. Aku bisa bantu kamu melacak pengeluaran, menganalisis pola spending, dan memberikan tips keuangan yang dipersonalisasi. Ada yang bisa aku bantu?",
        timestamp: new Date(),
      },
    ]);
    setIsInitialized(true);
  }, []);

  const addTransaction = useCallback(
    (transaction: Omit<Transaction, "id">) => {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
      };
      setTransactions((prev) => [newTransaction, ...prev]);

      // Finn reaction message
      const finnReaction = getFinnReaction(newTransaction);
      if (finnReaction) {
        setTimeout(() => {
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString() + "-reaction",
              role: "finn",
              content: finnReaction,
              timestamp: new Date(),
            },
          ]);
        }, 500);
      }
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addChatMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      setChatMessages((prev) => [
        ...prev,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ]);
    },
    []
  );

  const getMetrics = useCallback(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case "month":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    const filtered = transactions.filter(
      (t) => new Date(t.date) >= startDate
    );

    const totalIncome = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
    };
  }, [transactions, period]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        chatMessages,
        period,
        isInitialized,
        addTransaction,
        deleteTransaction,
        addChatMessage,
        setPeriod,
        getMetrics,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}

// Helper function for Finn's reactions
function getFinnReaction(transaction: Transaction): string {
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(transaction.amount);

  if (transaction.type === "income") {
    return `Bagus! Ditambahkan ${formattedAmount} ke ${transaction.category} income kamu. 💰`;
  } else {
    return `Transaksi tercatat: ${formattedAmount} untuk ${transaction.description}. Teruscatat ya!`;
  }
}