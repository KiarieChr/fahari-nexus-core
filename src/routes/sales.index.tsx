import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useSales } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales/")({
  head: () => ({
    meta: [
      { title: "Sales Ledger — Fahari Nexus" },
      { name: "description", content: "Historical transaction records and sales analytics." },
    ],
  }),
  component: SalesPage,
});

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    completed: {
      label: "Completed",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Clock,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: XCircle,
    },
    refunded: {
      label: "Refunded",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: ExternalLink,
    },
  };

  const config = configs[status.toLowerCase()] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
        config.color,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useSales({
    search: search || undefined,
    status: statusFilter || undefined,
    page: page,
  });

  const sales = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNext = !!data?.next;
  const hasPrev = !!data?.previous;

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display font-bold">
            Registry · Transaction Audit
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Sales <span className="text-brass">Ledger</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Audit and manage all register activity with live synchronization
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 px-4 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
            <Download className="size-3.5" />
            Export CSV
          </button>
          <Link
            to="/pos"
            className="h-10 px-5 rounded-md bg-navy text-brass-light hover:bg-navy/90 transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest border border-brass/20 shadow-xl shadow-navy/20"
          >
            <Plus className="size-3.5" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sale number or customer entity…"
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
          />
        </div>
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass" />
          <select className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none appearance-none cursor-pointer focus:border-brass/60">
            <option>All Date Cycles</option>
            <option>Today's Shift</option>
            <option>Last 7 Business Days</option>
            <option>Current Fiscal Month</option>
          </select>
        </div>
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none appearance-none cursor-pointer focus:border-brass/60"
          >
            <option value="">All Transactions</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/20">
                <th className="px-8 py-4 font-bold">Reference #</th>
                <th className="px-8 py-4 font-bold">Timestamp</th>
                <th className="px-8 py-4 font-bold">Customer Profile</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Payment</th>
                <th className="px-8 py-4 font-bold text-right">Grand Total</th>
                <th className="px-8 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-20" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-32" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-40" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-6 bg-muted rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-20 ml-auto" />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="size-4 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="size-16 rounded-full bg-muted/30 grid place-items-center mb-2">
                        <FileText className="size-8 opacity-20" />
                      </div>
                      <p className="font-serif italic text-xl">No transaction records found</p>
                      <p className="text-xs uppercase tracking-widest max-w-xs">
                        Adjust your search parameters or start a new sale from the POS terminal.
                      </p>
                      <Link
                        to="/pos"
                        className="mt-4 px-6 py-2 rounded-full border border-brass/40 text-brass text-[10px] uppercase tracking-widest font-bold hover:bg-brass hover:text-navy transition-all"
                      >
                        Launch Terminal
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale: any) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-muted/40 transition-all duration-300 group cursor-pointer"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-brass tabular-nums group-hover:underline">
                      {sale.sale_number}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-foreground font-medium">
                        {new Date(sale.sale_date).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(sale.sale_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-brass/5 border border-brass/20 grid place-items-center text-brass shadow-inner group-hover:bg-brass group-hover:text-navy transition-all">
                          <User className="size-3.5" />
                        </div>
                        <div className="text-sm text-foreground font-semibold truncate max-w-[180px]">
                          {sale.customer_name || "Walk-in Associate"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={sale.status} />
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <CreditCard className="size-3.5 text-brass/60" />
                        {sale.payment_method}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold tabular-nums text-foreground group-hover:text-brass transition-colors">
                      Ksh {sale.total.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                          className="p-2 rounded-md hover:bg-brass/10 text-muted-foreground hover:text-brass transition-all"
                          title="Print Receipt"
                        >
                          <Printer className="size-4" />
                        </button>
                        <button className="p-2 rounded-md hover:bg-brass/10 text-muted-foreground hover:text-brass transition-all">
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between bg-card border border-border px-8 py-4 rounded-xl shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing <span className="text-foreground">{sales.length}</span> of{" "}
          <span className="text-foreground">{totalCount}</span> Transactions
        </p>
        <div className="flex gap-3">
          <button
            disabled={!hasPrev || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="px-6 py-2 rounded-lg border border-border bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous Cycle
          </button>
          <button
            disabled={!hasNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 rounded-lg border border-border bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next Cycle
          </button>
        </div>
      </div>
    </div>
  );
}
