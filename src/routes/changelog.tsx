import { createFileRoute } from "@tanstack/react-router";
import { changelog, ChangelogEntry, ChangelogItem, ChangeType } from "@/data/changelog";
import { cn } from "@/lib/utils";
import { GitBranch, Tag, Calendar, CheckCircle2, Plus, Wrench, RefreshCw, Trash2, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog — Fahari Nexus ERP" },
      { name: "description", content: "Release history and version notes for Fahari Nexus ERP platform." },
    ],
  }),
  component: ChangelogPage,
});

// ─── Type config ────────────────────────────────────────────────────────────
const typeConfig: Record<ChangeType, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  added:    { label: "Added",    icon: Plus,         color: "text-emerald-500", bg: "bg-emerald-500/10",  border: "border-emerald-500/20" },
  fixed:    { label: "Fixed",    icon: Wrench,        color: "text-blue-400",   bg: "bg-blue-400/10",    border: "border-blue-400/20"   },
  changed:  { label: "Changed",  icon: RefreshCw,     color: "text-amber-400",  bg: "bg-amber-400/10",   border: "border-amber-400/20"  },
  removed:  { label: "Removed",  icon: Trash2,        color: "text-rose-500",   bg: "bg-rose-500/10",    border: "border-rose-500/20"   },
  security: { label: "Security", icon: ShieldCheck,   color: "text-purple-400", bg: "bg-purple-400/10",  border: "border-purple-400/20" },
};

const bumpColors: Record<string, string> = {
  major: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  minor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  patch: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
};

// ─── Change Item ────────────────────────────────────────────────────────────
function ChangeItem({ item }: { item: ChangelogItem }) {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;
  return (
    <li className="flex items-start gap-3 group">
      <span className={cn(
        "mt-0.5 shrink-0 inline-flex size-5 items-center justify-center rounded-md border text-[10px]",
        cfg.bg, cfg.border, cfg.color
      )}>
        <Icon className="size-3" />
      </span>
      <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
        {item.description}
      </span>
    </li>
  );
}

// ─── Version Card ───────────────────────────────────────────────────────────
function VersionCard({ entry, isLatest }: { entry: ChangelogEntry; isLatest: boolean }) {
  const grouped = entry.changes.reduce<Record<ChangeType, ChangelogItem[]>>((acc, item) => {
    (acc[item.type] ??= []).push(item);
    return acc;
  }, {} as Record<ChangeType, ChangelogItem[]>);

  const orderedTypes: ChangeType[] = ["added", "fixed", "changed", "removed", "security"];

  return (
    <div className={cn(
      "relative rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md overflow-hidden",
      isLatest ? "border-brass/40 shadow-brass/5" : "border-border"
    )}>
      {isLatest && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brass via-brass-light to-transparent" />
      )}

      {/* Header */}
      <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-border bg-muted/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "size-10 rounded-xl flex items-center justify-center shrink-0",
            isLatest ? "bg-brass/10 text-brass" : "bg-muted/50 text-muted-foreground"
          )}>
            <Tag className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={cn(
                "font-display text-xl tracking-tight",
                isLatest ? "text-brass" : "text-foreground"
              )}>
                v{entry.version}
              </h2>
              {isLatest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brass/10 border border-brass/20 text-[10px] font-bold uppercase tracking-widest text-brass">
                  <Zap className="size-2.5" /> Latest
                </span>
              )}
              <span className={cn(
                "px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest",
                bumpColors[entry.bumpType]
              )}>
                {entry.bumpType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(entry.date).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-1.5">
          {orderedTypes.map((type) => {
            const count = grouped[type]?.length;
            if (!count) return null;
            const cfg = typeConfig[type];
            return (
              <span key={type} className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest",
                cfg.bg, cfg.border, cfg.color
              )}>
                {count} {cfg.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Changes */}
      <div className="px-6 py-5 space-y-5">
        {orderedTypes.map((type) => {
          const items = grouped[type];
          if (!items?.length) return null;
          const cfg = typeConfig[type];
          const Icon = cfg.icon;
          return (
            <div key={type}>
              <div className={cn("flex items-center gap-2 mb-3 text-[10px] font-black uppercase tracking-[0.15em]", cfg.color)}>
                <Icon className="size-3.5" />
                {cfg.label}
              </div>
              <ul className="space-y-2 pl-1">
                {items.map((item, i) => <ChangeItem key={i} item={item} />)}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
function ChangelogPage() {
  const latest = changelog[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-brass text-[10px] font-black uppercase tracking-[0.2em]">
          <GitBranch className="size-3.5" />
          Release History
        </div>
        <h1 className="font-display text-4xl text-foreground tracking-tight">Changelog</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
          All notable changes to Fahari Nexus ERP are documented here. Run{" "}
          <code className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono text-foreground">
            .\bump.ps1 -BumpType patch
          </code>{" "}
          to create a new release.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <div className="text-2xl font-display text-foreground">{changelog.length}</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Releases</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <div className="text-2xl font-display text-emerald-500">
            {changelog.reduce((s, e) => s + e.changes.filter(c => c.type === "added").length, 0)}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Features Added</div>
        </div>
        <div className="p-4 rounded-2xl bg-card border border-border text-center">
          <div className="text-2xl font-display text-blue-400">
            {changelog.reduce((s, e) => s + e.changes.filter(c => c.type === "fixed").length, 0)}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">Bugs Fixed</div>
        </div>
      </div>

      {/* Latest banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
        <div className="text-sm text-emerald-600 font-semibold">
          You are running <span className="font-black">v{latest.version}</span> — the latest release.
        </div>
      </div>

      {/* Version cards */}
      <div className="space-y-6">
        {changelog.map((entry, i) => (
          <VersionCard key={entry.version} entry={entry} isLatest={i === 0} />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-border text-center text-[11px] text-muted-foreground">
        Fahari Nexus ERP — Semantic Versioning (MAJOR.MINOR.PATCH)
      </div>
    </div>
  );
}
