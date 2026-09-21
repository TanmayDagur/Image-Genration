"use client";
import { useEffect, useState, useRef } from "react";

interface ChatSession {
  id: string;
  title: string | null;
  updatedAt: string;
}

export function ChatHistorySidebar({ 
  activeChatId, 
  onSelectChat 
}: { 
  activeChatId: string | null;
  onSelectChat: (id: string | null) => void;
}) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const sessionsRef = useRef<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        sessionsRef.current = data;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionsRef.current.length === 0) {
      fetchSessions();
    } else if (activeChatId && !sessionsRef.current.some(s => s.id === activeChatId)) {
      fetchSessions();
    }
  }, [activeChatId]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
      if (res.ok) {
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        sessionsRef.current = newSessions;
        if (activeChatId === id) {
          onSelectChat(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return <div className="px-3 py-2 text-sm text-[var(--text-muted)]">Loading...</div>;
  }

  if (sessions.length === 0) {
    return <div className="px-3 py-2 text-sm text-[var(--text-muted)]">No history found.</div>;
  }

  return (
    <div className="flex flex-col gap-1">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSelectChat(session.id)}
          className={`
            group
            flex
            items-center
            justify-between
            rounded-lg
            px-3
            py-2
            text-sm
            cursor-pointer
            transition
            ${activeChatId === session.id 
              ? "bg-[var(--surface-tertiary)] text-[var(--foreground)] font-medium" 
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--foreground)]"}
          `}
        >
          <span className="truncate">
            {session.title || "New Chat"}
          </span>

          <button
            onClick={(e) => handleDelete(e, session.id)}
            className="
              hidden
              group-hover:flex
              items-center
              justify-center
              text-[var(--text-muted)]
              hover:text-red-500
            "
            title="Delete"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
