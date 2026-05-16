import {
  Outlet,
  Link,
  createRootRoute,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import appCss from "../styles.css?url";
import { queryClient } from "@/lib/query-client";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "@/components/layout/app-layout";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/confirm-dialog";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const publicPaths = ["/login", "/register"];

    // Skip auth check on server as localStorage is client-only
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("fahari-token");
    const isQuotePortal = location.pathname.startsWith("/quote/");
    const isPublicPath = publicPaths.includes(location.pathname);

    // If no token and not on a public path or quote portal, redirect to login
    if (!token && !isPublicPath && !isQuotePortal) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // If token exists, we should verify it on initial load or transition to private routes
    if (token && !isPublicPath && !isQuotePortal) {
      try {
        // We can use the profile endpoint as a lightweight session check
        // Using axios directly to avoid any query client sync issues during beforeLoad
        const { api } = await import("@/lib/api");
        await api.get("/api/v1/profile/");
      } catch (error: any) {
        // If 401, the interceptor in api.ts will handle cleanup, 
        // but we should explicitly redirect here too if the interceptor didn't already
        if (error.response?.status === 401) {
          localStorage.removeItem("fahari-token");
          localStorage.removeItem("fahari-refresh");
          localStorage.removeItem("fahari-user");
          throw redirect({
            to: "/login",
            search: {
              redirect: location.href,
            },
          });
        }
      }
    }

    // If logged in and on login/register, go to dashboard
    if (token && isPublicPath) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Fahari Nexus — Premium ERP & POS" },
      {
        name: "description",
        content:
          "Fahari Nexus is a premium, high-performance ERP and Point of Sale platform for modern enterprises.",
      },
      { name: "author", content: "Fahari Nexus" },
      { property: "og:title", content: "Fahari Nexus — Premium ERP & POS" },
      {
        property: "og:description",
        content: "A premium, API-driven ERP & POS suite built for power users.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}


function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConfirmProvider>
          <AppLayout>
            <Outlet />
          </AppLayout>
        </ConfirmProvider>
        <Toaster richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
