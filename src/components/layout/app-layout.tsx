import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AppSidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthPage = ["/login", "/register"].includes(pathname);

  if (isAuthPage) {
    return <main className="min-h-dvh flex flex-col">{children}</main>;
  }

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
