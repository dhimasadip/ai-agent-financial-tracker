"use client";

import React, { useRef, useEffect } from "react";
import { useTransactions } from "@/contexts/TransactionContext";
import { ChatMessage as ChatMessageType } from "@/contexts/TransactionContext";
import { ChatBubble } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { QuickActions } from "./QuickActions";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  onOpenModal: () => void;
}

export function ChatPanel({ onOpenModal }: ChatPanelProps) {
  const { chatMessages, addChatMessage } = useTransactions();
  const { theme, toggleTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleUserMessage = (message: string) => {
    addChatMessage({ role: "user", content: message });
    // Simulate Finn response
    setTimeout(() => {
      const finnResponse = getFinnResponse(message);
      addChatMessage({ role: "finn", content: finnResponse });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-primary border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white text-lg font-bold">F</span>
          </div>
          <div>
            <h1 className="font-semibold text-text">Finn</h1>
            <p className="text-xs text-muted">AI Financial Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className={cn(
              "p-2 rounded-lg bg-accent text-white",
              "hover:bg-accent-hover transition-colors"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-secondary text-text hover:bg-tertiary transition-colors"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {chatMessages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input with Suggestions */}
      <div className="border-t border-border">
        <QuickActions onAction={handleUserMessage} />
        <ChatInput onSend={handleUserMessage} />
      </div>
    </div>
  );
}

// Simple response generator
function getFinnResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("spending") || lower.includes("summary") || lower.includes("pengeluaran") || lower.includes("ringkasan")) {
    return "Berdasarkan transaksi kamu, pengeluaran utama ada di kategori Makanan & Belanja. Kamu sudah menghabiskan sekitar 45% dari income bulan ini. Mau lihat detailnya?";
  }

  if (lower.includes("save") || lower.includes("saving") || lower.includes("tabung") || lower.includes("menabung")) {
    return "Pertanyaan bagus! Aku sarankan coba aturan 50/30/20: 50% untuk kebutuhan, 30% untuk keinginan, dan 20% untuk tabungan. Saat ini kamu menabung sekitar 15% - ayo tingkatkan!";
  }

  if (lower.includes("budget") || lower.includes("check") || lower.includes("budget") || lower.includes("cek")) {
    return "Pengeluaran kamu saat ini masih dalam batas wajar, tapi mungkin bisa kurangi dining out sekitar 20% untuk mencapai tujuan tabungan lebih cepat.";
  }

  if (lower.includes("top") || lower.includes("expense") || lower.includes("terbesar") || lower.includes("pengeluaran")) {
    return "Pengeluaran terbesarmu bulan ini: 1) Gaji (income), 2) Proyek freelance (income), 3) Belanja Online Rp500.000. Mau lihat detailnya?";
  }

  return "Aku paham kamu bertanya tentang keuangan. Sebagai asisten AI, aku bisa bantu kamu melacak pengeluaran, menganalisis tren, dan memberikan saran menabung. Coba tanyakan ringkasan pengeluaran, tips menabung, atau cek budget!";
}