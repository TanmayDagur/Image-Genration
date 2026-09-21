"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-md)]">
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 text-[var(--foreground)] font-semibold text-xl gap-2 items-center">
            ✨ AI Studio
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Create an account
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[var(--foreground)] text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-4 flex justify-center items-center h-11"
          >
            {loading ? (
              <div className="flex items-center gap-1">
                <span className="loading-dot bg-white"></span>
                <span className="loading-dot bg-white"></span>
                <span className="loading-dot bg-white"></span>
              </div>
            ) : "Create account"}
          </button>
        </form>

        <p className="text-[var(--text-secondary)] text-sm text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
