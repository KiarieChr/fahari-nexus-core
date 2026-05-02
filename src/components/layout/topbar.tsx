import { Bell, Search, PanelLeft, Sun, Moon, LayoutPanelLeft, Zap } from "lucide-react";
import { useThemeStore, type ThemeMode } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "compact", label: "Compact", icon: LayoutPanelLeft },
];

export function Topbar() {
  const toggleSidebar = useThemeStore((s) => s.toggleSidebar);
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/70 backdrop-blur-xl sticky top-0 z-20 flex items-center px-4 md:px-6 gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-4" />
      </Button>

      <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass transition-colors" />
          <input
            type="text"
            placeholder="Search products, sales, customers…"
            className="w-full h-10 rounded-md bg-muted/60 border border-border pl-9 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:bg-background focus:border-brass/60 focus:ring-2 focus:ring-brass/20"
          />
          <kbd className="hidden md:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 h-6 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex-1 md:hidden" />

      {/* Theme switcher segmented */}
      <div className="hidden sm:flex items-center rounded-md border border-border bg-muted/40 p-0.5">
        {modes.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "h-8 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all",
                active
                  ? "bg-background text-foreground shadow-sm ring-1 ring-brass/30"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={m.label}
              title={m.label}
            >
              <Icon className="size-3.5" />
              <span className="hidden lg:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-brass/10 border border-brass/30 text-brass-dark dark:text-brass-light">
        <Zap className="size-3.5 fill-current" />
        <span className="text-xs font-medium tracking-wide">29 days left</span>
      </div>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="size-4" />
        <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
      </Button>

      <div className="flex items-center gap-2 pl-3 border-l border-border">
        <div className="size-9 rounded-full bg-gradient-to-br from-navy to-navy-deep grid place-items-center text-brass-light font-display text-sm ring-1 ring-brass/40">
          JM
        </div>
        <div className="hidden md:block min-w-0">
          <div className="text-sm font-medium leading-tight text-foreground truncate">james</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Administrator
          </div>
        </div>
      </div>
    </header>
  );
}