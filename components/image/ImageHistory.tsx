"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type ImageRecord = {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
};

export function ImageHistory() {
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/images");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/images/${id}`, { method: "DELETE" });
      setImages(images.filter((img) => img.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="px-3 py-2 text-sm text-[var(--text-muted)]">Loading history...</div>;

  if (images.length === 0) return <div className="px-3 py-2 text-sm text-[var(--text-muted)]">No images generated yet.</div>;

  return (
    <div className="flex flex-col gap-2 p-2">
      {images.map((img) => (
        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[var(--border)]">
          <img src={img.imageUrl} alt={img.prompt} className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
            <p className="text-xs text-white line-clamp-3">{img.prompt}</p>
            <button
              onClick={() => handleDelete(img.id)}
              className="self-end text-red-400 hover:text-red-300 p-1"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
