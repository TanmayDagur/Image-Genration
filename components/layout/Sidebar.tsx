import { ChatHistorySidebar } from "@/components/chat/ChatHistorySidebar";
import { ImageHistory } from "@/components/image/ImageHistory";

export function Sidebar({ 
  isOpen, 
  mode,
  activeChatId,
  onSelectChat
}: { 
  isOpen: boolean; 
  mode: "chat" | "image";
  activeChatId: string | null;
  onSelectChat: (id: string | null) => void;
}) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-[260px]
        border-r border-[var(--border)] bg-[var(--surface-secondary)]
        flex flex-col transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}
    >
      <div className="p-4">
        <h1 className="text-xl font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          ✨ AI Studio
        </h1>
        
        {mode === "chat" && (
          <button
            onClick={() => onSelectChat(null)}
            className="
              flex w-full items-center justify-center gap-2
              rounded-lg border border-[var(--border)] bg-[var(--surface)]
              px-3 py-2.5 text-sm transition hover:bg-[var(--surface-tertiary)] text-[var(--foreground)]
            "
          >
            <span className="text-lg">+</span>
            <span>New Chat</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mt-2 pb-4">
        <div className="px-4 text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wider">
          {mode === "chat" ? "Chats" : "Image History"}
        </div>
        {mode === "chat" ? (
          <div className="px-2">
            <ChatHistorySidebar activeChatId={activeChatId} onSelectChat={onSelectChat} />
          </div>
        ) : (
          <ImageHistory />
        )}
      </div>
    </aside>
  );
}
