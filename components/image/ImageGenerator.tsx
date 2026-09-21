"use client";
import { useState } from "react";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("Realistic");
  const [aspectRatio, setAspectRatio] = useState("1:1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImage(null);

    // Combine prompt with style context if needed
    const finalPrompt = style !== "None" ? `${prompt}, ${style} style` : prompt;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      if (data.imageUrl) {
        setImage(data.imageUrl);
      } else if (data.base64) {
        const mime = data.mimeType || "image/jpeg";
        setImage(`data:${mime};base64,${data.base64}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[850px] mx-auto flex-1 px-4 py-8 overflow-y-auto h-full">
      
      <div className="w-full max-w-2xl mb-8">
        <h2 className="text-2xl font-semibold text-[var(--foreground)] text-center mb-2">Create an image</h2>
        <p className="text-[var(--text-muted)] text-center mb-8">Describe what you want to generate...</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2">
            <textarea
              className="input resize-none min-h-[100px] text-lg"
              placeholder="A futuristic city at night..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Style</label>
              <select 
                className="input"
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
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Aspect Ratio</label>
              <select 
                className="input"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={loading}
              >
                <option value="1:1">1:1</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="btn-primary w-full py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <span className="loading-dot bg-white"></span>
                <span className="loading-dot bg-white"></span>
                <span className="loading-dot bg-white"></span>
              </>
            ) : "Generate Image"}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
            {error}
          </div>
        )}
      </div>

      {image && !loading && (
        <div className="w-full max-w-2xl flex justify-center animate-in fade-in duration-500">
          <div className="group relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)]">
            <img
              src={image}
              alt="Generated Result"
              className="w-full max-w-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = image;
                  link.download = 'generated-image.jpg';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="action-button bg-white/20 hover:bg-white/30 text-white border border-white/40"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
