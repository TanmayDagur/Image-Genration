import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function Navbar({ onMenuClick, userEmail }: { onMenuClick: () => void, userEmail?: string | null }) {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="md:hidden text-[var(--text-muted)] hover:text-[var(--foreground)]" onClick={onMenuClick}>
            ☰
          </button>
          <button className="font-medium text-[var(--foreground)]">
            AI Studio ▾
          </button>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="hidden sm:inline-block truncate max-w-[150px]">{userEmail}</span>
            <button onClick={() => signOut()} className="text-[var(--text-muted)] hover:text-red-500 transition" aria-label="Sign out">
               <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
