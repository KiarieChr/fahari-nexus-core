import {
  Outlet,
  Link,
  createRootRoute,
  redirect,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

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
        const { api } = await import("@/lib/api");
        await api.get("/api/v1/profile/");
      } catch (error: any) {
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
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

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
