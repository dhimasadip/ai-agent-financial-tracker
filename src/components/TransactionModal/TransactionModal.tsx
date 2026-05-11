"use client";

import React, { useState, FormEvent } from "react";
import { useTransactions, TransactionType, DEFAULT_CATEGORIES } from "@/contexts/TransactionContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionModal({ isOpen, onClose }: TransactionModalProps) {
  const { addTransaction } = useTransactions();
  const [type, setType] = useState<TransactionType>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = DEFAULT_CATEGORIES.filter((c) => c.type === type);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!description.trim()) newErrors.description = "Description is required";
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = "Valid amount is required";
    if (!category) newErrors.category = "Category is required";
    if (!date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addTransaction({
      type,
      description: description.trim(),
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim() || undefined,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-primary rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Add Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-text hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("");
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors",
                type === "income"
                  ? "bg-success text-white"
                  : "bg-secondary text-muted hover:bg-tertiary"
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
              className={cn(
                "flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors",
                type === "expense"
                  ? "bg-danger text-white"
                  : "bg-secondary text-muted hover:bg-tertiary"
              )}
            >
              Expense
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === "income" ? "e.g., Monthly Salary" : "e.g., Grocery Shopping"}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border bg-secondary text-text",
                "placeholder:text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/50",
                errors.description ? "border-danger" : "border-border"
              )}
            />
            {errors.description && (
              <p className="text-xs text-danger mt-1">{errors.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={cn(
                  "w-full pl-8 pr-4 py-2.5 rounded-lg border bg-secondary text-text",
                  "placeholder:text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-accent/50",
                  errors.amount ? "border-danger" : "border-border"
                )}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-danger mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                    category === cat.name
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-secondary text-muted hover:bg-tertiary hover:border-accent/30"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="text-xs text-danger mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border bg-secondary text-text",
                "focus:outline-none focus:ring-2 focus:ring-accent/50",
                errors.date ? "border-danger" : "border-border"
              )}
            />
            {errors.date && (
              <p className="text-xs text-danger mt-1">{errors.date}</p>
            )}
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Note <span className="text-muted">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border bg-secondary text-text resize-none",
                "placeholder:text-muted",
                "focus:outline-none focus:ring-2 focus:ring-accent/50",
                "border-border"
              )}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={cn(
              "w-full py-3 rounded-lg font-semibold text-white transition-colors",
              type === "income"
                ? "bg-success hover:bg-success/90"
                : "bg-danger hover:bg-danger/90"
            )}
          >
            Add {type === "income" ? "Income" : "Expense"}
          </button>
        </form>
      </div>
    </div>
  );
}