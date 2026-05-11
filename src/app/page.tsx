"use client";

import React, { useState } from "react";
import { ChatPanel } from "@/components/ChatPanel/ChatPanel";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { TransactionModal } from "@/components/TransactionModal/TransactionModal";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Mobile Chat Toggle Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg",
          "bg-accent text-white md:hidden",
          "hover:bg-accent-hover transition-colors"
        )}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Mobile Chat Overlay */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsChatOpen(false)}
          />
          {/* Chat Panel */}
          <div className="absolute inset-y-0 right-0 w-[400px] max-w-full bg-primary">
            <ChatPanel onOpenModal={() => {
              setIsChatOpen(false);
              setIsModalOpen(true);
            }} />
          </div>
        </div>
      )}

      {/* Desktop Chat Panel - Fixed width */}
      <div className="w-[400px] flex-shrink-0 hidden md:block">
        <ChatPanel onOpenModal={() => setIsModalOpen(true)} />
      </div>

      {/* Dashboard - Fluid width */}
      <div className="flex-1 min-w-0">
        <Dashboard />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  );
}