import type { ReactNode } from "react";
import { AppSidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex bg-background text-foreground">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}