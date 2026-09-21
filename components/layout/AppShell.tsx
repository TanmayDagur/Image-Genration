"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ImageGenerator } from "@/components/image/ImageGenerator";

export function AppShell({ userEmail }: { userEmail?: string | null }) {
  const [mode, setMode] = useState<"chat" | "image">("chat");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        mode={mode} 
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setIsMobileMenuOpen(false);
        }}
      />
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-screen w-full relative min-w-0">
        <Navbar 
          onMenuClick={() => setIsMobileMenuOpen(true)} 
          userEmail={userEmail} 
        />
        
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="w-full flex justify-center py-4 shrink-0 bg-[var(--background)]/80 backdrop-blur z-10 absolute top-0 left-0 right-0">
            {/* Mode selector */}
            <div className="inline-flex rounded-lg bg-[var(--surface-tertiary)] p-1">
              <button
                onClick={() => setMode("chat")}
                className={`rounded-md px-4 py-2 text-sm transition-shadow ${
                  mode === "chat" ? "bg-[var(--surface)] shadow-sm font-medium" : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMode("image")}
                className={`rounded-md px-4 py-2 text-sm transition-shadow ${
                  mode === "image" ? "bg-[var(--surface)] shadow-sm font-medium" : "text-[var(--text-secondary)] hover:text-[var(--foreground)]"
                }`}
              >
                🎨 Image
              </button>
            </div>
          </div>

          {/* Spacer for the fixed mode selector */}
          <div className="h-[68px] shrink-0" />

          <div className="flex-1 overflow-y-auto">
            {mode === "chat" ? (
              <ChatInterface chatId={activeChatId} onChatCreated={setActiveChatId} />
            ) : (
              <ImageGenerator />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
