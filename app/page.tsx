"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); 

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      if (data.base64) {
        setImage(`data:image/png;base64,${data.base64}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col items-center p-6 pb-32">

      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          Ai Image Generator
        </h1>
        <p className="text-slate-500 font-mono text-sm mt-2 mt-2">Generate images from text prompts</p>
      </div>

      
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="text-indigo-400 font-mono animate-pulse">Running inference...</p>
          </div>
        )}

        {image && !loading && (
          <div className="group relative">
            <img
              src={image}
              alt="Generated Result"
              onClick={() => setIsExpanded(true)}
              className="w-64 h-64 object-cover rounded-xl border-2 border-slate-700 cursor-zoom-in transition-all duration-300 hover:scale-105 hover:border-indigo-500 shadow-2xl"
            />
            <p className="text-center text-xs text-slate-500 mt-3 font-mono">Click to expand</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg font-mono text-sm max-w-md">
            {`> ERROR: ${error}`}
          </div>
        )}
      </div>

      
      {isExpanded && image && (
        <div 
          className="fixed inset-0 z-50 flex items-center  justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsExpanded(false)}
        >
          <img 
            src={image} 
            className="max-w-full max-h-full rounded-lg shadow-2xl border border-slate-800"
            alt="Expanded view"
          />
          <button className="absolute top-6 right-6 text-white cursor-pointer text-3xl font-light hover:text-indigo-400 transition-colors">
            &times;
          </button>
        </div>
      )}

      
      <footer className="fixed bottom-0 left-0 w-full p-6 bg-[#0f172a]/80 backdrop-blur-md border-t border-slate-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3">
          <input
            className="flex-1 bg-slate-900 border border-slate-700 p-3 rounded-lg text-indigo-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            placeholder="[SYSTEM]: Enter visual prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            disabled={loading}
            className="bg-indigo-600 cursor-pointer hover:bg-indigo-500 px-6 py-3 rounded-lg font-bold text-white transition-all disabled:bg-slate-800 disabled:text-slate-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
          >
            {loading ? "PROCES..." : "GENERATE"}
          </button>
        </form>
      </footer>
    </main>
  );
}
