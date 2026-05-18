import { useEffect, useState, useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, Sparkles } from "lucide-react";
import { navSections, type NavSection } from "./nav-config";
import { useThemeStore } from "@/store/theme";
import { useCompany, useInventorySettings } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
function isSectionActive(section: NavSection, pathname: string) {
  if (section.to && pathname === section.to) return true;
  if (section.children?.some((c) => pathname.startsWith(c.to))) return true;
  if (section.to && section.to !== "/" && pathname.startsWith(section.to)) return true;
  return false;
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = useThemeStore((s) => s.sidebarCollapsed);
  const { data: company } = useCompany();
  const { data: settings } = useInventorySettings();

  // Filter navigation based on enabled company modules
  const filteredNav = useMemo(
    () =>
      navSections
        .filter((section) => {
          if (section.id === "pos") return company?.enable_retail_mode || company?.enable_wholesale_mode;
          if (section.id === "restaurant-pro") return company?.enable_restaurant_mode;
          if (section.id === "bar-pro") return company?.enable_bar_mode;
          if (section.id === "hr") return company?.enable_hr_module;
          if (section.id === "accommodation") return company?.enable_accommodation_module;
          return true;
        })
        .map((section) => {
          if (section.id === "inventory" && !company?.enable_restaurant_mode && !company?.enable_bar_mode) {
            return {
              ...section,
              children: section.children?.filter((child) => child.id !== "recipes"),
            };
          }
          if (section.id === "purchases" && (settings?.enable_simple_stockin ?? true)) {
            return {
              ...section,
              children: section.children?.filter(
                (child) => !["rfq", "grn", "inspection"].includes(child.id || ""),
              ),
            };
          }
          return section;
        }),
    [company, settings],
  );

  const initial = useMemo(
    () => filteredNav.find((s) => s.children && isSectionActive(s, pathname))?.id ?? null,
    [filteredNav, pathname],
  );

  const [openId, setOpenId] = useState<string | null>(initial);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const active = filteredNav.find((s) => s.children && isSectionActive(s, pathname));
    if (active) setOpenId(active.id);
  }, [pathname, filteredNav]);

  useEffect(() => {
    const savedUser = localStorage.getItem("fahari-user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    import("@/lib/api").then(({ clearAuthData }) => {
      clearAuthData();
      window.location.href = "/login";
    });
  };

  return (
    <aside
      className={cn(
        "shrink-0 sticky top-0 h-dvh flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out z-50",
        collapsed ? "w-[76px]" : "w-72",
      )}
    >
      {/* Brand */}
      <div className="px-5 py-6 border-b border-sidebar-border/60 flex items-center gap-3">
        <div className="size-9 shrink-0 rounded-md bg-gradient-to-br from-brass-light to-brass-dark grid place-items-center shadow-lg shadow-black/30 ring-1 ring-brass/40">
          <Sparkles className="size-4 text-navy-deep" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display text-brass-light text-base tracking-[0.18em] uppercase truncate">
              Fahari Nexus
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 tracking-[0.25em] uppercase truncate">
              Enterprise Suite
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {filteredNav.map((section) => {
          const Icon = section.icon;
          const active = isSectionActive(section, pathname);
          const hasChildren = !!section.children?.length;
          const isOpen = openId === section.id && !collapsed;

          if (!hasChildren) {
            return (
              <Link
                key={section.id}
                to={`${section.to!}${section.search || ""}`}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all relative",
                  active
                    ? "bg-sidebar-accent text-brass-light"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-brass" />
                )}
                <Icon className={cn("size-4 shrink-0", active && "text-brass")} />
                {!collapsed && <span className="truncate font-medium">{section.label}</span>}
              </Link>
            );
          }

          const ButtonContent = (
            <button
              onClick={() => {
                if (!collapsed) setOpenId(isOpen ? null : section.id);
              }}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all relative",
                active
                  ? "bg-sidebar-accent text-brass-light"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-brass" />
              )}
              <Icon className={cn("size-4 shrink-0", active && "text-brass")} />
              {!collapsed && (
                <>
                  <span className="truncate font-medium flex-1 text-left">{section.label}</span>
                  <ChevronRight
                    className={cn(
                      "size-3.5 transition-transform text-sidebar-foreground/50",
                      isOpen && "rotate-90 text-brass",
                    )}
                  />
                </>
              )}
            </button>
          );

          if (collapsed) {
            return (
              <DropdownMenu key={section.id}>
                <DropdownMenuTrigger asChild>
                  {ButtonContent}
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={16} className="w-56 bg-sidebar border-sidebar-border text-sidebar-foreground">
                  <DropdownMenuLabel className="text-xs text-brass uppercase tracking-widest">{section.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-sidebar-border" />
                  {section.children?.map((child) => (
                    <DropdownMenuItem key={child.to} asChild className="cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-foreground">
                      <Link to={child.to}>
                        {child.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }

          return (
            <div key={section.id}>
              {ButtonContent}

              {isOpen && section.children && (
                <div className="mt-1 mb-2 ml-6 pl-3 border-l border-sidebar-border/60 space-y-0.5">
                  {section.children.map((child) => {
                    const childActive = pathname === child.to;
                    return (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={cn(
                          "block rounded-md px-3 py-1.5 text-[13px] transition-colors",
                          childActive
                            ? "text-brass-light bg-sidebar-accent/70"
                            : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / user */}
      <div className="px-3 py-4 border-t border-sidebar-border/60">
        <div
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent/60 transition-colors cursor-pointer group",
            collapsed && "justify-center",
          )}
        >
          <div className="size-9 rounded-full bg-brass/15 border border-brass/40 grid place-items-center text-brass font-display text-sm group-hover:bg-brass group-hover:text-navy-deep transition-all">
            {user?.full_name
              ? user.full_name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
              : "UN"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-sidebar-foreground truncate">
                {user?.full_name || "User Name"}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-brass/70 truncate">
                {user?.company || "Administrator"}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
