"use client";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatInterface({ 
  chatId, 
  onChatCreated 
}: { 
  chatId: string | null;
  onChatCreated?: (id: string) => void;
}) {
  const [model, setModel] = useState("groq");
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId);

  const { messages, setMessages, sendMessage, status, error } = useChat({
    body: { model, conversationId: activeChatId },
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const fetchedChatIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    setActiveChatId(chatId);
  }, [chatId]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (chatId === fetchedChatIdRef.current) return;
      
      setIsLoaded(false);
      if (chatId) {
        try {
          const res = await fetch(`/api/chats/${chatId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.messages) {
              setMessages(data.messages);
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setMessages([]);
      }
      setIsLoaded(true);
      fetchedChatIdRef.current = chatId;
    };

    fetchHistory();
  }, [chatId, setMessages]);
  
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    let targetChatId = activeChatId;
    
    if (!targetChatId) {
      try {
        const res = await fetch("/api/chats", {
          method: "POST",
          body: JSON.stringify({ title: input.slice(0, 40) }),
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        targetChatId = data.id;
        fetchedChatIdRef.current = targetChatId; // Prevent fetching history for this newly created chat
        setActiveChatId(targetChatId);
        if (onChatCreated) onChatCreated(targetChatId);
      } catch (e) {
        console.error("Failed to create chat", e);
      }
    }

    sendMessage({ role: "user", content: input }, { body: { model, conversationId: targetChatId } });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isLoaded) {
    return <div className="flex w-full h-full items-center justify-center text-[var(--text-muted)]">
      <div className="flex items-center gap-1">
        <span className="loading-dot" />
        <span className="loading-dot" />
        <span className="loading-dot" />
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col h-full w-full mx-auto max-w-[850px] relative">
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] mt-20">
            <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="w-full mb-6">
            {m.role === "user" ? (
              <div className="flex justify-end mb-2">
                <div className="max-w-[75%] rounded-2xl bg-[var(--user-message)] px-4 py-3 text-[15px] leading-6 whitespace-pre-wrap">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 py-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-semibold">
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <div className="prose max-w-none text-[15px] leading-6 text-[var(--foreground)] markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content || m.parts?.map((p: any) => (p.type === "text" ? p.text : "")).join("")}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <button className="action-button">👍</button>
                    <button className="action-button">👎</button>
                    <button className="action-button">↻</button>
                    <button className="action-button" onClick={() => navigator.clipboard.writeText(m.content)}>Copy</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 py-5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm font-semibold">
              AI
            </div>
            <div className="flex items-center gap-1 pt-2">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center mt-4">
            <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-500 rounded-lg text-sm">
              Error: {error.message}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-10">
        <div className="w-full rounded-2xl border border-[var(--input-border)] bg-[var(--input-background)] shadow-[var(--shadow-sm)] focus-within:shadow-[var(--shadow-md)] flex flex-col">
          <textarea
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-4 pt-4 pb-2 outline-none placeholder:text-[var(--text-muted)] min-h-[56px] max-h-[200px]"
            rows={1}
          />

          <div className="flex items-center justify-between px-3 pb-3">
            <div className="flex gap-2 items-center">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-transparent border border-[var(--border)] rounded text-xs p-1 text-[var(--text-muted)] outline-none"
              >
                <option value="groq">Qwen</option>
                <option value="gemini">Gemini</option>
                <option value="openai">GPT-4o</option>
              </select>
              <button className="action-button" title="Attach file">+</button>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ↑
            </button>
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-[var(--text-muted)]">
          AI can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}
