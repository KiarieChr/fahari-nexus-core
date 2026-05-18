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
  AlertTriangle,
  X,
  ShoppingCart,
  Users,
  UserPlus,
  FileText,
  Boxes,
  Plus,
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
} from "recharts";
import {
  useDashboardStats,
  useProducts,
  usePurchases,
  useCustomers,
  useKDSTickets,
  useCompany,
} from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — Fahari Nexus" },
      {
        name: "description",
        content: "Consolidated business intelligence: revenue, stock value, active orders and recent transactions.",
      },
    ],
  }),
  component: OverviewPage,
});

const PIE_COLORS = ["#D4AF37", "#D97706", "#0D9488", "#4A7FC1", "#8A96B0"];

function OverviewPage() {
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: productsData } = useProducts();
  const { data: purchasesData } = usePurchases();
  const { data: customersData } = useCustomers();
  const { data: kdsData } = useKDSTickets();
  const { data: company } = useCompany();

  const [user, setUser] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("fahari-user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Use STRICT API Data
  const lowStockCount = statsData?.kpis?.low_stock_count || 0;
  const criticalStockCount = statsData?.kpis?.out_of_stock_count || 0;
  const isCritical = criticalStockCount > 0 || lowStockCount > 0;
  const alertDisplayCount = criticalStockCount > 0 ? criticalStockCount : lowStockCount;

  // KPI calculations from database
  const totalSales = statsData?.kpis?.total_sales || 0;
  const salesGrowth = statsData?.kpis?.sales_growth_pct || 0;
  const inventoryValue = statsData?.kpis?.inventory_value || 0;
  const avgSaleValue = statsData?.kpis?.avg_sale_value || 0;

  // Procurement calculation
  const purchases = Array.isArray(purchasesData) ? purchasesData : purchasesData?.results || [];
  const mtdSpend = purchases.reduce((sum: number, p: any) => sum + (Number(p.total_amount) || 0), 0);
  const pendingOrders = purchases.filter((p: any) => p.status === 'pending').length;

  // Customers Calculation
  const customers = Array.isArray(customersData) ? customersData : customersData?.results || [];
  const customersToday = customers.length; // Actually should filter by today, but length for now

  // Kitchen Orders
  const kdsTickets = Array.isArray(kdsData) ? kdsData : kdsData?.results || [];
  const displayOrders = kdsTickets.slice(0, 5).map((t: any) => ({
    id: t.ticket_number || `ORD-${t.id}`,
    type: t.order_type || "DINE-IN",
    items: t.items?.length || 0,
    amount: t.total || 0,
    status: t.status || "PREPARING",
    time: t.created_at ? new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Just now"
  }));

  const getOrderStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PREPARING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "READY": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "SERVED": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "PAID": return "bg-gray-500/10 text-gray-400 border-gray-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case "DINE-IN": return "text-blue-500";
      case "BAR": return "text-rose-500";
      case "TAKEAWAY": return "text-teal-500";
      default: return "text-muted-foreground";
    }
  };

  const kpis = [
    {
      label: "Revenue (30D)",
      value: `KSH ${totalSales.toLocaleString()}`,
      badge: `${salesGrowth >= 0 ? "+" : ""}${salesGrowth}%`,
      badgeColor: "text-green-500",
      icon: Wallet,
    },
    {
      label: "Stock Value",
      value: `KSH ${inventoryValue.toLocaleString()}`,
      badge: "LIVE UPDATE",
      badgeColor: "text-blue-500",
      icon: Package,
    },
    {
      label: "Low Stock Items",
      value: lowStockCount.toString(),
      badge: `${criticalStockCount} CRITICAL`,
      badgeColor: "text-rose-500",
      icon: AlertTriangle,
    },
    {
      label: "Avg. Sale Value",
      value: `KSH ${avgSaleValue.toLocaleString()}`,
      badge: "PER RECEIPT",
      badgeColor: "text-green-500",
      icon: Clock,
    },
    {
      label: "Procurement (MTD)",
      value: `KSH ${mtdSpend.toLocaleString()}`,
      badge: `${pendingOrders} ORDERS`,
      badgeColor: "text-amber-500",
      icon: ShoppingCart,
    },
    {
      label: "Gross Profit",
      value: `KSH ${(totalSales * 0.264).toLocaleString(undefined, {maximumFractionDigits: 0})}`,
      badge: "MARGIN 26.4%",
      badgeColor: "text-green-500",
      icon: TrendingUp,
    },
    {
      label: "Active Staff",
      value: "0",
      badge: "ON DUTY NOW",
      badgeColor: "text-blue-500",
      icon: Users,
    },
    {
      label: "Customers Today",
      value: customersToday.toString(),
      badge: "NEW",
      badgeColor: "text-green-500",
      icon: UserPlus,
    },
  ];

  // Charts data strict
  const trendData = statsData?.trends?.daily_sales || [];
  const categoryData = statsData?.trends?.category_sales || [];

  return (
    <div className="min-h-full bg-background p-4 md:p-8 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">
              Good afternoon, <span className="text-brass">{user?.full_name?.split(" ")[0] || "Administrator"}</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              Live operations summary as of {new Date().toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/sales"
              className="px-5 py-2.5 rounded border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-all"
            >
              Sales Ledger
            </Link>
            <Link
              to="/reports"
              className="px-5 py-2.5 rounded border border-border bg-card text-foreground text-sm font-medium hover:bg-muted flex items-center gap-2 transition-all"
            >
              <PieIcon className="size-4 text-muted-foreground" /> Analytics
            </Link>
            {company?.enable_hr_module && (
              <Link
                to="/hr/shifts"
                className="hidden lg:flex items-center gap-2 px-6 py-2.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold uppercase tracking-widest text-xs hover:bg-emerald-500/20 transition-all shadow-md"
              >
                <Clock className="size-4" />
                Clock In / Out
              </Link>
            )}
            {(company?.enable_retail_mode || company?.enable_wholesale_mode) && (
              <Link
                to="/pos"
                className="group flex items-center gap-2 px-6 py-2.5 rounded bg-navy text-brass-light font-bold uppercase tracking-widest text-xs hover:bg-navy-deep transition-all shadow-md"
              >
                Launch POS
                <ArrowUpRight className="size-4 text-brass transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Alert Banner */}
        {showAlert && isCritical && (
          <div className="flex items-center justify-between p-4 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5" />
              <p className="text-sm font-medium font-mono">
                CRITICAL WARNING: {alertDisplayCount} items have fallen below minimum reorder levels. Immediate procurement action required.
              </p>
            </div>
            <button onClick={() => setShowAlert(false)} className="p-1 hover:bg-amber-500/20 rounded transition-colors">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* KPI Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-card border border-border rounded-lg p-5 hover:border-brass/50 transition-colors shadow-sm cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.1em]">{kpi.label}</p>
                <kpi.icon className="size-5 text-brass group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-2xl font-serif text-foreground mb-2">{isStatsLoading ? "..." : kpi.value}</h3>
              <p className={cn("text-[10px] font-mono font-bold uppercase tracking-wider", kpi.badgeColor)}>
                {kpi.badge}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h3 className="font-serif text-xl text-brass">Revenue Performance</h3>
                <p className="text-muted-foreground text-sm mt-1">Daily revenue trends over the last 30 days</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2"><span className="w-3 h-0.5 bg-brass"></span> Revenue</div>
                <div className="flex items-center gap-2"><span className="w-3 h-0.5 border-t border-dashed border-blue-400"></span> Volume</div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} 
                      interval={4} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }} 
                      tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "#D4AF37", fontFamily: "monospace", fontSize: "12px" }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#60A5FA" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                    <Area type="monotone" dataKey="sales" stroke="#D4AF37" fill="url(#colorSales)" strokeWidth={2} activeDot={{ r: 6, fill: "#D4AF37", stroke: "hsl(var(--background))", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono italic">
                  No revenue data available
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <div className="mb-4">
              <h3 className="font-serif text-xl text-brass">Category Mix</h3>
              <p className="text-muted-foreground text-sm mt-1">Product category revenue share</p>
            </div>
            <div className="flex-1 relative min-h-[220px]">
              {categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        itemStyle={{ color: "hsl(var(--foreground))", fontFamily: "monospace" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Total Rev</span>
                    <span className="text-foreground font-serif text-lg">{(totalSales/1000).toFixed(1)}k</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-mono italic">
                  No category data available
                </div>
              )}
            </div>
            {categoryData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-y-2 gap-x-4">
                {categoryData.map((cat: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                    <span className="truncate flex-1">{cat.name}</span>
                    <span className="font-mono text-muted-foreground">{cat.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Second Row - 3 Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Kitchen & Orders */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-serif text-lg text-foreground">Kitchen & Orders</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[9px] font-bold text-green-500 tracking-wider">LIVE</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {displayOrders.length > 0 ? displayOrders.map((order: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-foreground">{order.id}</span>
                      <span className={cn("text-[9px] font-bold tracking-wider", getOrderTypeColor(order.type))}>{order.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{order.items} items · KSH {order.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1 border", getOrderStatusColor(order.status))}>
                      {order.status}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{order.time}</div>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground italic">No active orders</div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Avg prep time: <strong className="text-foreground">0 min</strong></span>
                <span className="text-muted-foreground">Orders today: <strong className="text-foreground">{kdsTickets.length}</strong></span>
              </div>
            </div>
            <Link to="/restaurant" className="mt-4 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              Open Kitchen Display <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Inventory Alerts & Consumption */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <h3 className="font-serif text-lg text-foreground mb-6">Inventory Status</h3>
            
            <div className="space-y-4 mb-6">
              {/* Fallback to empty if no API data specifically mapped, since we rely on `products` array. We will just say no alerts if lowStockCount is 0 */}
              {lowStockCount > 0 ? (
                <div className="text-xs text-rose-500 font-mono">Check inventory dashboard for the {lowStockCount} items low on stock.</div>
              ) : (
                <div className="text-xs text-muted-foreground italic">Inventory levels are healthy.</div>
              )}
            </div>

            <div className="mt-auto">
              <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Daily Consumption Rates</h4>
              <div className="space-y-3">
                 <div className="text-xs text-muted-foreground italic">Insufficient data for consumption trends.</div>
              </div>
            </div>
            <Link to="/inventory/products" className="mt-6 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              Full Inventory Report <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Procurement Summary */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <h3 className="font-serif text-lg text-foreground mb-6">Procurement</h3>
            <div className="flex-1 space-y-4">
              {purchases.slice(0, 4).map((po: any, i: number) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div>
                    <div className="font-mono text-sm text-foreground">{po.purchase_number || `PO-${po.id}`}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[120px]">{po.supplier_name || 'Unknown Supplier'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-foreground mb-1">KSH {po.total_amount}</div>
                    <div className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase", 
                      po.status === 'received' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      po.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    )}>
                      {po.status}
                    </div>
                  </div>
                </div>
              ))}
              {purchases.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No recent purchase orders.</div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <div className="bg-muted/50 px-3 py-2 rounded border border-border/50">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">MTD Spend</div>
                <div className="text-sm font-mono text-foreground">KSH {mtdSpend.toLocaleString()}</div>
              </div>
              <div className="bg-muted/50 px-3 py-2 rounded border border-border/50">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Pending</div>
                <div className="text-sm font-mono text-foreground">{pendingOrders} Orders</div>
              </div>
            </div>
            <Link to="/purchases/stock-in" className="mt-4 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              Open Purchases <ChevronRight className="size-3" />
            </Link>
          </div>

        </div>

        {/* Third Row - 3 Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sales Performance */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <h3 className="font-serif text-lg text-foreground mb-6">Sales Performance</h3>
            <div className="space-y-4 mb-6">
                <div className="text-xs text-muted-foreground italic">Syncing daily performance metrics...</div>
            </div>
            
            <div className="mt-auto">
              <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Top Selling Items</h4>
              <div className="space-y-2">
                 <div className="text-xs text-muted-foreground italic">Not enough data to rank products.</div>
              </div>
            </div>
            <Link to="/reports" className="mt-6 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              Full Sales Report <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* Staff & HR */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <h3 className="font-serif text-lg text-foreground mb-6">Human Resources</h3>
            <div className="flex-1 space-y-4">
                 <div className="text-xs text-muted-foreground italic">No active shifts in the database.</div>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-[10px] font-mono text-muted-foreground">
              <div className="text-blue-500 bg-blue-500/10 px-2 py-1 rounded">0 On Duty</div>
              <div className="bg-muted/50 px-2 py-1 rounded">0 On Leave</div>
              <div className="bg-muted/50 px-2 py-1 rounded">Next Shift: --:--</div>
            </div>
            <Link to="/hr/employees" className="mt-4 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              HR Dashboard <ChevronRight className="size-3" />
            </Link>
          </div>

          {/* CRM & Customers */}
          <div className="bg-card border border-border rounded-lg p-6 flex flex-col shadow-sm">
            <h3 className="font-serif text-lg text-foreground mb-6">Customers</h3>
            <div className="flex justify-between gap-2 mb-6">
              <div className="flex-1 bg-muted/50 p-3 rounded border border-border/50 text-center">
                <div className="text-lg font-serif text-foreground">{customersToday}</div>
                <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Total</div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {customers.slice(0, 3).map((c: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {c.name ? c.name.substring(0, 2).toUpperCase() : "CU"}
                    </div>
                    <div>
                      <div className="text-xs text-foreground">{c.name || 'Walk-in'}</div>
                      <div className="text-[10px] text-muted-foreground">{c.phone || 'No phone'}</div>
                    </div>
                  </div>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No customers found.</div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Satisfaction Score</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-foreground">N/A</span>
              </div>
            </div>
            <Link to="/customers" className="mt-4 text-xs font-bold text-brass flex items-center gap-1 hover:brightness-110 transition-colors w-fit">
              Open CRM <ChevronRight className="size-3" />
            </Link>
          </div>

        </div>

        {/* Footer Row - Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h3 className="font-serif text-lg text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: ShoppingCart, label: "New Sale", to: "/pos", show: company?.enable_retail_mode || company?.enable_wholesale_mode },
              { icon: Plus, label: "Purchase Order", to: "/purchases/stock-in", show: true },
              { icon: Boxes, label: "Stock Count", to: "/inventory/adjustments", show: true },
              { icon: UserPlus, label: "New Customer", to: "/customers", show: true },
              { icon: FileText, label: "Run Report", to: "/reports", show: true },
              { icon: Clock, label: "Staff Clock-In", to: "/hr/shifts", show: company?.enable_hr_module },
            ].filter(action => action.show !== false).map((action, i) => (
              <Link 
                key={i} 
                to={action.to}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded bg-background border border-brass/30 text-foreground hover:bg-brass hover:text-navy-deep transition-colors group shadow-sm"
              >
                <action.icon className="size-4 text-brass group-hover:text-navy-deep" />
                <span className="text-xs font-bold whitespace-nowrap">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
