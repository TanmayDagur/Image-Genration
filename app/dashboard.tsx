"use client";
import { AppShell } from "@/components/layout/AppShell";

export function Dashboard({ user }: { user: { name?: string | null; email?: string | null } }) {
  return <AppShell userEmail={user?.email} />;
}
