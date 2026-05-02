import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Package,
  ShoppingBag,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — Fahari Nexus" },
      {
        name: "description",
        content:
          "Consolidated business intelligence: revenue, stock value, active orders and recent transactions.",
      },
    ],
  }),
  component: OverviewPage,
});

const metrics = [
  {
    label: "Revenue (30d)",
    value: "Ksh 1,847,200",
    delta: "+12.4%",
    deltaPositive: true,
    icon: Wallet,
  },
  {
    label: "Stock Value",
    value: "Ksh 312,450",
    delta: "Stable",
    deltaPositive: true,
    icon: Package,
  },
  {
    label: "Active Orders",
    value: "128",
    delta: "+8 today",
    deltaPositive: true,
    icon: ShoppingBag,
  },
  {
    label: "Avg. Sale Time",
    value: "1m 42s",
    delta: "-14s",
    deltaPositive: true,
    icon: Clock,
  },
];

const transactions = [
  { id: "TX-8829-Z", desc: "Baking Flour 2kg × 12", customer: "Walk-in Customer", amount: "Ksh 4,200" },
  { id: "TX-9014-K", desc: "Bar Soap 175g × 48", customer: "Acme Distributors", amount: "Ksh 12,800" },
  { id: "TX-4412-M", desc: "Cooking Oil 5L × 6", customer: "Nakuru Hotel Ltd", amount: "Ksh 27,500" },
  { id: "TX-2210-A", desc: "Sugar 2kg × 24", customer: "Walk-in Customer", amount: "Ksh 6,720" },
];

function OverviewPage() {
  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brass mb-2 font-display">
            Dashboard · Executive Overview
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Good afternoon, <span className="text-brass">James</span>
          </h1>
          <p className="text-muted-foreground mt-2 italic font-serif">
            Consolidated business position as of today
          </p>
        </div>
        <Link
          to="/pos"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-to-r from-brass-dark to-brass text-navy-deep font-medium text-sm shadow-lg shadow-brass/20 hover:shadow-brass/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          New Sale
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-brass/40 hover:shadow-xl hover:shadow-black/5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-5">
                <div className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground">
                  {m.label}
                </div>
                <div className="size-9 rounded-md bg-brass/10 border border-brass/20 grid place-items-center text-brass">
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="font-display text-2xl text-foreground tabular-nums">{m.value}</div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-widest">
                <TrendingUp className="size-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{m.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-foreground tracking-wide">
              Recent Transactions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest sales across all registers
            </p>
          </div>
          <button className="text-xs font-display uppercase tracking-widest text-brass hover:text-brass-dark transition-colors border-b border-brass/30 pb-0.5">
            View statement
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-6 py-4 text-brass tabular-nums text-sm">{t.id}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{t.desc}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground italic font-serif">
                    {t.customer}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium tabular-nums text-foreground">
                    {t.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
