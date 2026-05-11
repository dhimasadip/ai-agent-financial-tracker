"use client";

import React, { useState, useRef, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSend(message);
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t border-border">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Finn anything about your finances..."
        disabled={disabled || isLoading}
        className={cn(
          "flex-1 resize-none rounded-xl border border-border bg-secondary px-4 py-3 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          "placeholder:text-muted",
          "transition-colors"
        )}
        rows={1}
      />

      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={cn(
          "px-4 rounded-xl bg-accent text-white",
          "hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-colors flex items-center justify-center"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}