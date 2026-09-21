import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Dashboard } from "./dashboard";

export default async function Home() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200">
      <Dashboard user={session.user} />
    </main>
  );
}