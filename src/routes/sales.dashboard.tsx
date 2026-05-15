import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Activity,
  PieChart as PieIcon,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CreditCard,
  Zap,
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
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useDashboardStats, useReports } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sales/dashboard")({
  head: () => ({
    meta: [
      { title: "Sales Dashboard — Fahari Nexus" },
      { name: "description", content: "Executive sales analytics and performance trends." },
    ],
  }),
  component: SalesDashboardPage,
});

const COLORS = ["#D4AF37", "#1A2B3C", "#708090", "#4A5D23", "#8B0000"];

function SalesDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: reportData, isLoading: reportLoading } = useReports({ type: "sales_summary" });

  const kpis = [
    {
      label: "Today's Revenue",
      value: `Ksh ${stats?.kpis.total_sales.toLocaleString() || "0"}`,
      change: `+${stats?.kpis.sales_growth_pct}%`,
      isPositive: true,
      icon: DollarSign,
      desc: "Daily net collection",
    },
    {
      label: "Sales Velocity",
      value: `${stats?.recent_sales.length || 0}`,
      change: "Transactions",
      isPositive: true,
      icon: Zap,
      desc: "Recent sales volume",
    },
    {
      label: "Avg. Ticket Size",
      value: `Ksh ${stats?.kpis.avg_sale_value.toLocaleString() || "0"}`,
      change: "Live",
      isPositive: true,
      icon: ShoppingCart,
      desc: "Value per customer",
    },
    {
      label: "Sales Growth",
      value: `${stats?.kpis.sales_growth_pct}%`,
      change: "Monthly",
      isPositive: (stats?.kpis.sales_growth_pct ?? 0) >= 0,
      icon: TrendingUp,
      desc: "Performance vs prev.",
    },
  ];

  const trendData =
    stats?.trends.daily_sales.map((d) => ({
      name: d.label,
      revenue: d.total,
    })) || [];

  const categoryData = stats?.trends.category_sales || [];

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display font-bold">
            Analytics Terminal · Sales Intelligence
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">
            Sales <span className="text-brass">Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-2 italic font-serif">
            Live sales trajectory and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-brass/40 hover:shadow-2xl hover:shadow-black/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="size-10 rounded-xl bg-brass/5 border border-brass/20 grid place-items-center text-brass group-hover:bg-brass group-hover:text-navy transition-all duration-300">
                <kpi.icon className="size-5" />
              </div>
              <div
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                  kpi.isPositive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500",
                )}
              >
                {kpi.change}
              </div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              {kpi.label}
            </div>
            <div className="font-display text-2xl text-foreground tabular-nums tracking-tight mb-1">
              {kpi.value}
            </div>
            <div className="text-[10px] text-muted-foreground italic font-serif">{kpi.desc}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Main Sales Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-8 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                <Activity className="size-5 text-brass" />
                Revenue Performance
              </h3>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium italic font-serif">
                Gross sales trajectory over time
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="size-2 rounded-full bg-brass" />
                Net Sales
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {statsLoading ? (
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
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#888" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#888" }}
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
                    }}
                    itemStyle={{ color: "#D4AF37" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
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

        {/* Category Share */}
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

          <div className="h-[400px] w-full">
            {statsLoading ? (
              <div className="w-full h-full flex items-center justify-center animate-pulse bg-muted/20 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={80}
                    outerRadius={110}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-8">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <CreditCard className="size-5 text-brass" />
              Payment Channels
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium italic font-serif">
              Revenue distribution by payment method
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: "M-Pesa", value: 65, color: "#4A5D23" },
                  { name: "Cash", value: 25, color: "#D4AF37" },
                  { name: "Card", value: 10, color: "#1A2B3C" },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="rgba(212, 175, 55, 0.05)"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888", fontWeight: "bold" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(212, 175, 55, 0.05)" }}
                  contentStyle={{ backgroundColor: "#1A2B3C", border: "none", borderRadius: "8px" }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {[0, 1, 2].map((i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Performance Hours */}
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="mb-8">
            <h3 className="font-display text-lg text-foreground flex items-center gap-2">
              <Clock className="size-5 text-brass" />
              Peak Traffic Hours
            </h3>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-medium italic font-serif">
              Busiest periods throughout the operational day
            </p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { h: "08:00", v: 12 },
                  { h: "10:00", v: 45 },
                  { h: "12:00", v: 88 },
                  { h: "14:00", v: 76 },
                  { h: "16:00", v: 54 },
                  { h: "18:00", v: 92 },
                  { h: "20:00", v: 65 },
                  { h: "22:00", v: 22 },
                ]}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(212, 175, 55, 0.05)"
                />
                <XAxis
                  dataKey="h"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#888" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(212, 175, 55, 0.05)" }}
                  contentStyle={{ backgroundColor: "#1A2B3C", border: "none", borderRadius: "8px" }}
                />
                <Bar dataKey="v" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
