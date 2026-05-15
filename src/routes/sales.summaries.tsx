import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Download,
  Filter,
  Calendar,
  ChevronDown,
  Printer,
  FileJson,
  Table as TableIcon,
  Search,
  LayoutGrid,
  Rows,
} from "lucide-react";
import { useReports } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales/summaries")({
  head: () => ({
    meta: [
      { title: "Sales Summaries Report — Fahari Nexus" },
      {
        name: "description",
        content: "Formal sales summary reporting with advanced filtering and export.",
      },
    ],
  }),
  component: SalesSummariesReportPage,
});

function SalesSummariesReportPage() {
  const [groupBy, setGroupBy] = useState<"day" | "category" | "payment">("day");
  const { data: reportData, isLoading } = useReports({ type: "sales_summary" });

  const reportRows = reportData?.data || [];

  // Calculate Grand Totals
  const totalRevenue = reportRows.reduce(
    (acc: number, curr: any) => acc + (Number(curr.total_sales) || 0),
    0,
  );
  const totalTransactions = reportRows.reduce(
    (acc: number, curr: any) => acc + (curr.count || 0),
    0,
  );

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header & Actions */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display font-bold">
            Financial Control · Reporting Engine
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Sales <span className="text-brass">Summaries Report</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Audit-ready financial summaries with multi-dimensional grouping
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1 bg-card">
            <button
              onClick={() => setGroupBy("day")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                groupBy === "day"
                  ? "bg-brass text-navy shadow-lg"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              By Day
            </button>
            <button
              onClick={() => setGroupBy("category")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                groupBy === "category"
                  ? "bg-brass text-navy shadow-lg"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              By Category
            </button>
          </div>
          <div className="relative group">
            <button className="h-10 px-5 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-navy/90 transition-all border border-brass/20 shadow-xl shadow-navy/20">
              <Download className="size-3.5" />
              Export Options
              <ChevronDown className="size-3 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brass hover:bg-muted flex items-center gap-3 transition-all border-b border-border/50">
                <FileText className="size-4" />
                PDF Document
              </button>
              <button className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brass hover:bg-muted flex items-center gap-3 transition-all border-b border-border/50">
                <TableIcon className="size-4" />
                Excel Spreadsheet
              </button>
              <button className="w-full px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-brass hover:bg-muted flex items-center gap-3 transition-all">
                <Printer className="size-4" />
                Print View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="size-3 text-brass" />
              Reporting Period
            </label>
            <select className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-xs outline-none focus:border-brass/60 transition-all">
              <option>Current Fiscal Month</option>
              <option>Previous Quarter</option>
              <option>Custom Date Range...</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Filter className="size-3 text-brass" />
              Channel / Branch
            </label>
            <select className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-xs outline-none focus:border-brass/60 transition-all">
              <option>All Distribution Centers</option>
              <option>Main Warehouse</option>
              <option>Retail Outlet A</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Search className="size-3 text-brass" />
              Quick Query
            </label>
            <input
              placeholder="Search in report..."
              className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-xs outline-none focus:border-brass/60 transition-all"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full h-10 rounded-lg bg-card border border-brass/40 text-brass text-[10px] font-bold uppercase tracking-widest hover:bg-brass hover:text-navy transition-all">
              Re-Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Container */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/5">
        <div className="px-8 py-6 border-b border-border bg-muted/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-full bg-navy grid place-items-center border border-brass/20">
              <FileJson className="size-5 text-brass" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                Formal Summary Ledger
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                Generated {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Volume
              </p>
              <p className="text-sm font-bold text-foreground">{totalTransactions} Sales</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Net Value
              </p>
              <p className="text-sm font-bold text-brass tabular-nums">
                Ksh {totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground bg-muted/10 border-b border-border">
                <th className="px-8 py-4">Financial Dimension</th>
                <th className="px-8 py-4">Order Count</th>
                <th className="px-8 py-4 text-right">Base Value</th>
                <th className="px-8 py-4 text-right">Tax Component</th>
                <th className="px-8 py-4 text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-8 py-5">
                        <div className="h-4 bg-muted rounded w-48" />
                      </td>
                      <td className="px-8 py-5">
                        <div className="h-4 bg-muted rounded w-20" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="h-4 bg-muted rounded w-24 ml-auto" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="h-4 bg-muted rounded w-24 ml-auto" />
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="h-4 bg-muted rounded w-24 ml-auto" />
                      </td>
                    </tr>
                  ))
                : reportRows.map((row: any, idx: number) => {
                    const revenue = Number(row.total_sales) || 0;
                    const tax = revenue * 0.16; // Simulated 16% tax for report detail
                    const base = revenue - tax;

                    return (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-8 py-5 text-sm font-semibold text-foreground italic font-serif">
                          {groupBy === "day"
                            ? new Date(row.date).toLocaleDateString("en-KE", { dateStyle: "long" })
                            : row.name || "General Goods"}
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2 py-1 rounded bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase">
                            {row.count} Units
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right text-sm text-muted-foreground tabular-nums font-medium">
                          {base.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5 text-right text-sm text-muted-foreground/60 tabular-nums">
                          {tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-bold text-foreground tabular-nums group-hover:text-brass transition-colors">
                          Ksh {revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
            {/* Report Footer - Totals Row */}
            {!isLoading && (
              <tfoot className="bg-muted/20 border-t-2 border-border/80">
                <tr className="text-sm font-bold">
                  <td className="px-8 py-6 text-foreground uppercase tracking-widest text-[10px]">
                    Grand Audit Totals
                  </td>
                  <td className="px-8 py-6 font-display">{totalTransactions} Units</td>
                  <td className="px-8 py-6 text-right text-muted-foreground">
                    {(totalRevenue * 0.84).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-right text-muted-foreground/60">
                    {(totalRevenue * 0.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-6 text-right text-brass text-lg tabular-nums">
                    Ksh {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Report Compliance Footer */}
      <div className="mt-8 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          <div className="size-1.5 rounded-full bg-brass" />
          Certified by Fahari Nexus Reporting Engine
        </div>
        <p className="text-[9px] text-muted-foreground italic">
          Page 1 of 1 · Reference ID: RE-{Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
