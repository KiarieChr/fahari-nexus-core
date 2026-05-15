import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Package,
  ShoppingBag,
  Clock,
  ChevronRight,
  PieChart as PieIcon,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useDashboardStats } from "@/lib/api-hooks";

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

const COLORS = ["#D4AF37", "#1A2B3C", "#708090", "#4A5D23", "#8B0000"];

function OverviewPage() {
  const { data, isLoading } = useDashboardStats();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("fahari-user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const metrics = [
    {
      label: "Revenue (30d)",
      value: isLoading ? "..." : `Ksh ${data?.kpis.total_sales.toLocaleString()}`,
      delta: isLoading ? "..." : `${data?.kpis.sales_growth_pct}%`,
      deltaPositive: (data?.kpis.sales_growth_pct ?? 0) >= 0,
      icon: Wallet,
    },
    {
      label: "Stock Value",
      value: isLoading ? "..." : `Ksh ${data?.kpis.inventory_value.toLocaleString()}`,
      delta: "Live Update",
      deltaPositive: true,
      icon: Package,
    },
    {
      label: "Low Stock Items",
      value: isLoading ? "..." : data?.kpis.low_stock_count.toString(),
      delta: `${data?.kpis.out_of_stock_count ?? 0} Critical`,
      deltaPositive: false,
      icon: ShoppingBag,
    },
    {
      label: "Avg. Sale Value",
      value: isLoading ? "..." : `Ksh ${data?.kpis.avg_sale_value.toLocaleString()}`,
      delta: "Per Receipt",
      deltaPositive: true,
      icon: Clock,
    },
  ];

  const transactions = data?.recent_sales || [];
  const trendData = data?.trends.daily_sales || [];
  const categoryData = data?.trends.category_sales || [];

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display font-bold">
            Analytics Dashboard · Business Intelligence
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Good afternoon,{" "}
            <span className="text-brass">{user?.full_name?.split(" ")[0] || "Member"}</span>
          </h1>
          <p className="text-muted-foreground mt-2 italic font-serif">
            Live operations summary as of{" "}
            {new Date().toLocaleDateString("en-KE", { dateStyle: "full" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/sales"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-all"
          >
            Sales Ledger
          </Link>
          <Link
            to="/sales/dashboard"
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-lg border border-brass/20 bg-brass/5 text-brass text-sm font-medium hover:bg-brass/10 transition-all"
          >
            <TrendingUp className="size-4" />
            Analytics
          </Link>
          <Link
            to="/pos"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-navy text-brass-light font-bold uppercase tracking-widest text-xs shadow-xl shadow-navy/20 hover:shadow-navy/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch POS
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-brass/40 hover:shadow-2xl hover:shadow-black/5"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brass/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-5">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {m.label}
                </div>
                <div className="size-10 rounded-xl bg-brass/10 border border-brass/20 grid place-items-center text-brass group-hover:bg-brass group-hover:text-navy transition-all duration-300">
                  <Icon className="size-5" />
                </div>
              </div>
              <div className="font-display text-2xl text-foreground tabular-nums tracking-tight">
                {m.value}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${m.deltaPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                >
                  {m.delta}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <Activity className="size-5 text-brass" />
                Revenue Performance
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium italic font-serif">
                Daily revenue trends over the last 30 days
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <div className="size-2 rounded-full bg-brass" />
              Sales Volume
            </div>
          </div>

          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-muted/20 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(212, 175, 55, 0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#888", fontFamily: "Inter" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#888", fontFamily: "Inter" }}
                    tickFormatter={(val) =>
                      `Ksh ${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A2B3C",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "Outfit",
                    }}
                    itemStyle={{ color: "#D4AF37" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#D4AF37"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="rounded-2xl border border-border bg-card p-8 group">
          <div className="mb-8">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <PieIcon className="size-5 text-brass" />
              Category Mix
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium italic font-serif">
              Product category revenue share
            </p>
          </div>

          <div className="h-[300px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-muted/20 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    animationDuration={1500}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A2B3C",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/10">
          <div>
            <h2 className="font-display text-xl text-foreground tracking-wide flex items-center gap-2">
              Recent Activity
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium">
              Latest sales synchronized with backend
            </p>
          </div>
          <Link
            to="/sales"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass hover:text-brass-dark transition-all flex items-center gap-1 group"
          >
            Audit Sales Ledger
            <ChevronRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 bg-muted/5 border-b border-border">
                <th className="px-8 py-4 font-bold">Reference</th>
                <th className="px-8 py-4 font-bold">Payment Path</th>
                <th className="px-8 py-4 font-bold">Customer Entity</th>
                <th className="px-8 py-4 font-bold text-right">Net Value</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-border/60">
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-20" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-32" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-20 text-center text-muted-foreground italic font-serif"
                  >
                    <Clock className="size-10 text-muted-foreground/20 mx-auto mb-4" />
                    No transactions recorded in this cycle
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr
                    key={t.id}
                    className="group border-b border-border/60 last:border-0 hover:bg-muted/40 transition-all duration-300"
                  >
                    <td className="px-8 py-5 text-brass tabular-nums text-sm font-bold">
                      {t.sale_number}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-0.5 rounded-md bg-navy/5 text-navy text-[10px] font-bold uppercase tracking-widest border border-navy/10">
                        {t.payment_method}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-foreground/80 font-medium italic font-serif group-hover:text-foreground transition-colors">
                      {t.customer_name || "Walk-in Associate"}
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold tabular-nums text-foreground group-hover:text-brass transition-colors">
                      KES {t.total.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
