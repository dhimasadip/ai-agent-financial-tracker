"use client";

import React from "react";
import { ChatMessage } from "@/contexts/TransactionContext";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatMessageProps) {
  const isFinn = message.role === "finn";

  // Format time only on client side to avoid hydration mismatch
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        isFinn ? "justify-start" : "justify-end"
      )}
    >
      {isFinn && (
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">F</span>
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5",
          isFinn
            ? "bg-secondary text-text"
            : "bg-accent text-white"
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={cn(
            "text-xs mt-1",
            isFinn ? "text-muted" : "text-white/70"
          )}
        >
          <span suppressHydrationWarning>{formatTime(message.timestamp)}</span>
        </p>
      </div>
    </div>
  );
}