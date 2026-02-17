import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-zinc-700 selection:text-zinc-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-20" />
      {children}
      <Toaster position="top-right" richColors theme="dark" />
    </div>
  );
}
