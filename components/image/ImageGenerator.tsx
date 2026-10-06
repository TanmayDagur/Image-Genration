"use client";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ImageGenerator({ 
  chatId, 
  onChatCreated 
}: { 
  chatId: string | null;
  onChatCreated?: (id: string) => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId);
  const [isLoaded, setIsLoaded] = useState(false);
  const fetchedChatIdRef = useRef<string | null | undefined>(undefined);

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setError(null);

    // Optimistically add user message
    const tempUserMsgId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempUserMsgId, role: "user", content: currentPrompt }]);

    // Combine prompt with style context if needed
    const finalPrompt = style !== "None" ? `${currentPrompt}, ${style} style` : currentPrompt;

    let targetChatId = activeChatId;

    if (!targetChatId) {
      try {
        const res = await fetch("/api/chats", {
          method: "POST",
          body: JSON.stringify({ title: currentPrompt.slice(0, 40), isImage: true }),
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        targetChatId = data.id;
        fetchedChatIdRef.current = targetChatId; 
        setActiveChatId(targetChatId);
        if (onChatCreated && targetChatId) onChatCreated(targetChatId);
      } catch (e) {
        console.error("Failed to create chat", e);
      }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, conversationId: targetChatId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      let imageUrl = "";
      if (data.imageUrl) {
        imageUrl = data.imageUrl;
      } else if (data.base64) {
        const mime = data.mimeType || "image/jpeg";
        imageUrl = `data:${mime};base64,${data.base64}`;
      }

      setMessages(prev => [...prev, { 
        id: Date.now().toString() + "img", 
        role: "assistant", 
        content: `![Generated Image](${imageUrl})` 
      }]);

    } catch (err: any) {
      setError(err.message);
      // Remove the optimistic user message if it failed completely (or leave it and show error)
    } finally {
      setLoading(false);
    }
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
    <div className="flex flex-col h-full w-full mx-auto relative">
      <div className="flex-1 overflow-y-auto px-4 pb-40">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] mt-20">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] text-center mb-2">Create an image</h2>
            <p className="text-[var(--text-muted)] text-center">Describe what you want to generate...</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="w-full mb-6 mt-4">
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
                  <div className="prose max-w-none text-[15px] leading-6 text-[var(--foreground)] markdown-content image-render-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content || ""}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <button className="action-button" onClick={() => {
                      // Extract image url if possible
                      const match = m.content.match(/\((.*?)\)/);
                      if (match && match[1]) {
                        const link = document.createElement('a');
                        link.href = match[1];
                        link.download = 'generated-image.jpg';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}>Download</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
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
              Error: {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-10">
        <div className="w-full max-w-[850px] mx-auto rounded-2xl border border-[var(--input-border)] bg-[var(--input-background)] shadow-[var(--shadow-sm)] focus-within:shadow-[var(--shadow-md)] flex flex-col p-3 gap-3">
          
          <div className="flex gap-3">
            <select 
              className="bg-transparent border border-[var(--border)] rounded text-xs p-1.5 text-[var(--text-muted)] outline-none flex-1 max-w-[120px]"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              disabled={loading}
            >
              <option value="Realistic">Realistic</option>
              <option value="Anime">Anime</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Cyberpunk">Cyberpunk</option>
              <option value="None">None</option>
            </select>
            
            <select 
              className="bg-transparent border border-[var(--border)] rounded text-xs p-1.5 text-[var(--text-muted)] outline-none flex-1 max-w-[120px]"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              disabled={loading}
            >
              <option value="1:1">1:1</option>
              <option value="16:9">16:9</option>
              <option value="9:16">9:16</option>
            </select>
          </div>

          <div className="flex gap-2">
            <textarea
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full resize-none bg-transparent outline-none placeholder:text-[var(--text-muted)] min-h-[44px] max-h-[150px] py-2"
              rows={1}
            />

            <button
              onClick={() => handleSubmit()}
              disabled={loading || !prompt.trim()}
              className="flex h-10 w-10 shrink-0 self-end items-center justify-center rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
