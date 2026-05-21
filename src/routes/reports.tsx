import { useState } from "react";
import { flushSync } from "react-dom";
import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Download, 
  FileSpreadsheet,
  FileText,
  Loader2,
  PieChart,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Hourglass,
  RefreshCw,
  ShoppingBag,
  Trash2,
  GitBranch,
  ShieldAlert,
  Coins,
  Percent,
  ClipboardCheck,
  Activity,
  Sliders,
  Shuffle,
  Activity as ForecastIcon
} from "lucide-react";
import { useReports, useBranches, useCompany, useUserProfile } from "@/lib/api-hooks";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
 
export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Intelligence & Reports — Fahari Nexus" },
      { name: "description", content: "Business analytics, dynamic inventory valuation, and audits." },
    ],
  }),
  component: ReportsPage,
});

const REPORT_SECTIONS = [
  {
    group: "Sales & Financials",
    items: [
      { id: "sales_summary", label: "Sales Summary", icon: BarChart3, desc: "Daily volume and revenue insights" },
      { id: "stock_valuation", label: "Costing Valuation (BOM/FIFO/LIFO)", icon: PieChart, desc: "Inventory assets balance sheets" },
      { id: "void_comp", label: "Voids & Complimentary Audits", icon: ShieldAlert, desc: "Cancellations, comps & non-revenue events" },
    ]
  },
  {
    group: "Stock Position & Alerts",
    items: [
      { id: "current_stock", label: "Current Stock Position", icon: Package, desc: "Real-time SKU stock levels" },
      { id: "stock_aging", label: "Stock Aging & Expiry", icon: Hourglass, desc: "Shelf life & perishable tracking" },
      { id: "low_stock", label: "Low Stock Alerts", icon: AlertTriangle, desc: "Depleting item tracking" },
      { id: "reorder_report", label: "Reorder & Supplier Forecast", icon: Calendar, desc: "Procurement volume recommendations" },
      { id: "dead_stock", label: "Dead Stock Recovery", icon: ShieldAlert, desc: "Unsold sluggish asset liquidation" },
    ]
  },
  {
    group: "Food Costing & Margin Control",
    items: [
      { id: "food_cost_percentage", label: "Food Cost % Report", icon: Percent, desc: "BOM ingredient cost to price ratio" },
      { id: "gross_profit_per_dish", label: "Gross Profit per Dish", icon: Coins, desc: "Portion profit and margin analysis" },
      { id: "cogs_report", label: "Cost of Goods Sold (COGS)", icon: FileSpreadsheet, desc: "Material consumption vs revenue P&L" },
      { id: "menu_engineering", label: "Menu Engineering Matrix", icon: TrendingUp, desc: "Stars, Plowhorses, Puzzles & Dogs quadrants" },
    ]
  },
  {
    group: "Purchase & Receiving",
    items: [
      { id: "purchase_order", label: "Purchase Order Performance", icon: ShoppingBag, desc: "Ordered vs received items tracking" },
      { id: "grn_report", label: "Goods Received Note Registry", icon: FileText, desc: "Supplier delivery and inspection logs" },
      { id: "supplier_performance", label: "Supplier Performance Scorecards", icon: TrendingUp, desc: "Delivery accuracy, lead times & rejections" },
      { id: "purchase_vs_budget", label: "Purchase Spend vs Budget", icon: BarChart3, desc: "Category spend against monthly targets" },
    ]
  },
  {
    group: "Consumption & Usage",
    items: [
      { id: "daily_consumption", label: "Daily Kitchen Consumption", icon: Calendar, desc: "Daily raw material usage deductions" },
      { id: "theoretical_vs_actual", label: "Theoretical vs Actual Usage", icon: RefreshCw, desc: "Ingredient yield variances & portion shrinkage" },
      { id: "consumption_rate", label: "Consumption Velocity & Rate", icon: Hourglass, desc: "Average daily usage & inventory velocity" },
      { id: "recipe_breakdown", label: "Dish-Level Cost Breakdowns", icon: Package, desc: "Dishes sold mapped to consumed ingredients" },
      { id: "wastage_report", label: "Wastage & Spoilage Audit", icon: Trash2, desc: "Spoilage, spills, prep waste & damaged logs" },
    ]
  },
  {
    group: "Movements & Departmental Transfers",
    items: [
      { id: "stock_movement", label: "Stock Movement Ledger", icon: Activity, desc: "Audit trail of every single stock transaction" },
      { id: "inter_department_transfer", label: "Inter-Department Transfers", icon: Shuffle, desc: "Internal stock moves between outlets" },
      { id: "stock_adjustment", label: "Stock Adjustments Audit", icon: Sliders, desc: "Manual quantity corrections & audit reasons" },
    ]
  },
  {
    group: "Forecasting & Demand Projections",
    items: [
      { id: "consumption_forecast", label: "Consumption Projections", icon: ForecastIcon, desc: "7/14/30 day ingredient demand forecasts" },
      { id: "reorder_quantity_suggestion", label: "Smart Order Suggestions", icon: CheckCircle2, desc: "Formula-based auto PO quantities" },
      { id: "seasonal_trend", label: "Seasonal & Weekend Spikes", icon: Calendar, desc: "Weekday vs weekend average consumption rates" },
    ]
  },
  {
    group: "Audit & Regulatory Compliance",
    items: [
      { id: "physical_vs_system", label: "Physical Count vs System", icon: ClipboardCheck, desc: "Stocktake gap & variance reconciliation" },
      { id: "high_value_tracking", label: "High-Value Item Tracking", icon: ShieldAlert, desc: "Premium spirit & premium meat gram audit logs" },
      { id: "inventory_turnover", label: "Inventory Turnover Index", icon: RefreshCw, desc: "Stock velocity cycles & COGS turnover ratios" },
    ]
  }
];

function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales_summary");
  const [branchId, setBranchId] = useState("all");
  const [costingMethod, setCostingMethod] = useState("FIFO");
  const [deadDays, setDeadDays] = useState("30");
  const [exporting, setExporting] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: branches } = useBranches();
  const { data: company } = useCompany();
  const { data: profile } = useUserProfile();
  
  // Dynamic report hooks
  const { data: reportData, isLoading: loadingReport } = useReports({
    type: activeTab,
    branch_id: branchId,
    costing_method: costingMethod,
    days: deadDays
  });

  const formatKES = (val: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatReportDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const day = parseInt(parts[2], 10);
    
    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return dateStr;

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayOfWeek = days[date.getDay()];
    const monthName = months[month];

    // Get ordinal suffix
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    return `${dayOfWeek}, ${day}${suffix} ${monthName} ${year}`;
  };

  const loadHtml2Pdf = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).html2pdf) {
        resolve((window as any).html2pdf);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = () => {
        if ((window as any).html2pdf) {
          resolve((window as any).html2pdf);
        } else {
          reject(new Error("html2pdf failed to load"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load html2pdf script"));
      document.head.appendChild(script);
    });
  };

  /**
   * html2canvas does not understand modern CSS color functions like oklch().
   * This function injects a <style> tag into the target element that overrides
   * every CSS custom property (--color-*, --background, etc.) with a safe
   * pre-computed rgb/hex value so html2canvas can render correctly.
   * Returns a cleanup function to remove the injected style.
   */
  const injectHtml2CanvasColorFallbacks = (element: HTMLElement): () => void => {
    const isDark = document.documentElement.classList.contains("dark");
    
    // Pre-computed rgb equivalents for all oklch values in styles.css
    const lightVars: Record<string, string> = {
      "--brass-light":                   "rgb(212,185,143)",
      "--brass":                          "rgb(179,143,87)",
      "--brass-dark":                     "rgb(126,103,62)",
      "--navy-deep":                      "rgb(22,25,52)",
      "--navy":                           "rgb(32,36,74)",
      "--background":                     "rgb(249,247,242)",
      "--foreground":                     "rgb(30,33,68)",
      "--card":                           "rgb(255,255,255)",
      "--card-foreground":                "rgb(30,33,68)",
      "--popover":                        "rgb(255,255,255)",
      "--popover-foreground":             "rgb(30,33,68)",
      "--primary":                        "rgb(22,25,52)",
      "--primary-foreground":             "rgb(245,242,235)",
      "--secondary":                      "rgb(242,239,232)",
      "--secondary-foreground":           "rgb(22,25,52)",
      "--muted":                          "rgb(242,240,234)",
      "--muted-foreground":               "rgb(118,122,162)",
      "--accent":                         "rgb(179,143,87)",
      "--accent-foreground":              "rgb(22,27,54)",
      "--destructive":                    "rgb(183,51,30)",
      "--destructive-foreground":         "rgb(250,248,244)",
      "--border":                         "rgb(228,222,208)",
      "--input":                          "rgb(234,229,216)",
      "--ring":                           "rgb(179,143,87)",
      "--chart-1":                        "rgb(179,143,87)",
      "--chart-2":                        "rgb(72,130,196)",
      "--chart-3":                        "rgb(55,163,118)",
      "--chart-4":                        "rgb(196,148,47)",
      "--chart-5":                        "rgb(130,47,196)",
      "--sidebar":                        "rgb(22,25,52)",
      "--sidebar-foreground":             "rgb(212,206,196)",
      "--sidebar-primary":                "rgb(179,143,87)",
      "--sidebar-primary-foreground":     "rgb(22,25,52)",
      "--sidebar-accent":                 "rgb(40,44,82)",
      "--sidebar-accent-foreground":      "rgb(212,185,143)",
      "--sidebar-border":                 "rgba(68,76,122,0.5)",
      "--sidebar-ring":                   "rgb(179,143,87)",
      // Tailwind mapped versions
      "--color-background":              "rgb(249,247,242)",
      "--color-foreground":              "rgb(30,33,68)",
      "--color-card":                    "rgb(255,255,255)",
      "--color-card-foreground":         "rgb(30,33,68)",
      "--color-popover":                 "rgb(255,255,255)",
      "--color-popover-foreground":      "rgb(30,33,68)",
      "--color-primary":                 "rgb(22,25,52)",
      "--color-primary-foreground":      "rgb(245,242,235)",
      "--color-secondary":               "rgb(242,239,232)",
      "--color-secondary-foreground":    "rgb(22,25,52)",
      "--color-muted":                   "rgb(242,240,234)",
      "--color-muted-foreground":        "rgb(118,122,162)",
      "--color-accent":                  "rgb(179,143,87)",
      "--color-accent-foreground":       "rgb(22,27,54)",
      "--color-destructive":             "rgb(183,51,30)",
      "--color-destructive-foreground":  "rgb(250,248,244)",
      "--color-border":                  "rgb(228,222,208)",
      "--color-input":                   "rgb(234,229,216)",
      "--color-ring":                    "rgb(179,143,87)",
      "--color-brass":                   "rgb(179,143,87)",
      "--color-brass-light":             "rgb(212,185,143)",
      "--color-brass-dark":              "rgb(126,103,62)",
      "--color-navy":                    "rgb(32,36,74)",
      "--color-navy-deep":               "rgb(22,25,52)",
    };

    const darkVars: Record<string, string> = {
      ...lightVars,
      "--background":                    "rgb(20,22,48)",
      "--foreground":                    "rgb(232,228,218)",
      "--card":                          "rgb(28,32,62)",
      "--card-foreground":               "rgb(232,228,218)",
      "--popover":                       "rgb(28,32,62)",
      "--popover-foreground":            "rgb(232,228,218)",
      "--primary":                       "rgb(179,143,87)",
      "--primary-foreground":            "rgb(22,25,52)",
      "--secondary":                     "rgb(34,38,70)",
      "--secondary-foreground":          "rgb(232,228,218)",
      "--muted":                         "rgb(30,34,66)",
      "--muted-foreground":              "rgb(158,152,138)",
      "--destructive":                   "rgb(190,62,35)",
      "--border":                        "rgba(68,76,122,0.6)",
      "--input":                         "rgba(56,62,102,0.8)",
      "--sidebar":                       "rgb(14,16,40)",
      "--color-background":             "rgb(20,22,48)",
      "--color-foreground":             "rgb(232,228,218)",
      "--color-card":                   "rgb(28,32,62)",
      "--color-card-foreground":        "rgb(232,228,218)",
      "--color-muted":                  "rgb(30,34,66)",
      "--color-muted-foreground":       "rgb(158,152,138)",
      "--color-primary":                "rgb(179,143,87)",
      "--color-border":                 "rgba(68,76,122,0.6)",
    };

    const vars = isDark ? darkVars : lightVars;
    const cssText = `:root, * { ${Object.entries(vars).map(([k, v]) => `${k}: ${v} !important;`).join(" ")} }`;
    const styleEl = document.createElement("style");
    styleEl.id = "__html2canvas-oklch-fallback";
    styleEl.textContent = cssText;
    element.prepend(styleEl);
    
    return () => styleEl.remove();
  };

  const handleExport = async (format: "excel" | "pdf" | "word") => {
    try {
      setExporting(format);
      
      // Client-Side High-Fidelity PDF Fallback
      if (format === "pdf") {
        try {
          // 1. Attempt backend WeasyPrint export first
          const response = await api.get("/api/v1/reports/", {
            params: {
              type: activeTab,
              branch_id: branchId,
              costing_method: costingMethod,
              days: deadDays,
              export: "true",
              format: format
            },
            responseType: "blob"
          });
          
          const rawPdfContentType = response.headers["content-type"];
          const blob = new Blob([response.data], { type: typeof rawPdfContentType === "string" ? rawPdfContentType : undefined });
          if (blob.size > 200) { // Check that we didn't get an empty or tiny error response
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const rawPdfDisposition = response.headers["content-disposition"];
            const disposition = typeof rawPdfDisposition === "string" ? rawPdfDisposition : undefined;
            let filename = `${activeTab}_report.pdf`;
            if (disposition && disposition.indexOf("attachment") !== -1) {
              const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
              const matches = filenameRegex.exec(disposition);
              if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
              }
            }
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            return;
          }
        } catch (err) {
          console.warn("Backend PDF generation unavailable. Using high-fidelity client-side PDF export fallback...", err);
        }
        
        // 2. Client-side fallback rendering
        
        // Scroll to top to prevent html2canvas from rendering out-of-viewport headers/footers as blank
        window.scrollTo(0, 0);
        
        flushSync(() => {
          setIsGeneratingPDF(true);
        });
        
        // Ensure the browser has painted the expanded table
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        let cleanupColorFallback: (() => void) | null = null;
        try {
          const html2pdfLib = await loadHtml2Pdf();
          const element = document.getElementById("report-export-container");
          if (!element) {
            throw new Error("Report export container not found");
          }
          
          // Inject safe rgb fallbacks so html2canvas doesn't choke on oklch()
          cleanupColorFallback = injectHtml2CanvasColorFallbacks(element);
          
          const opt = {
            margin:       0.3,
            filename:     `${activeTab}_report.pdf`,
            image:        { type: 'jpeg', quality: 0.95 },
            html2canvas:  { 
              scale: 1.5, 
              useCORS: true, 
              logging: false,
              // Ensure white background so transparent oklch backgrounds render cleanly
              backgroundColor: '#ffffff',
              // Allow cross-origin images
              allowTaint: false,
            },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
          };
          
          await html2pdfLib().set(opt).from(element).save();
        } finally {
          if (cleanupColorFallback) cleanupColorFallback();
          setIsGeneratingPDF(false);
        }
        return;
      }

      // Standard Word/Excel exports
      const response = await api.get("/api/v1/reports/", {
        params: {
          type: activeTab,
          branch_id: branchId,
          costing_method: costingMethod,
          days: deadDays,
          export: "true",
          format: format
        },
        responseType: "blob"
      });
      
      const rawContentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: typeof rawContentType === "string" ? rawContentType : undefined });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const rawDisposition = response.headers["content-disposition"];
      const disposition = typeof rawDisposition === "string" ? rawDisposition : undefined;
      let filename = `${activeTab}_report.${format === "excel" ? "xlsx" : "doc"}`;
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed exporting report", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1700px] mx-auto min-h-screen">
      {/* Page Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap border-b border-white/5 pb-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display">
            Business Intelligence · Auditing
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Fahari Intelligence Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Live operations auditing, dynamic costing, and multi-format financial analytics
          </p>
        </div>

        {/* Global Multi-Branch & Export Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Branch Select */}
          <div className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-3 h-10 shadow-sm dark:shadow-none">
            <GitBranch className="size-3.5 text-brass" />
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="bg-transparent border-0 text-xs text-slate-800 dark:text-white focus:outline-none font-sans cursor-pointer h-full pr-4"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">All Branches / Warehouse</option>
              {branches?.map((b: any) => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{b.name}</option>
              ))}
            </select>
          </div>

          {/* Action Export Buttons */}
          <Button 
            onClick={() => handleExport("excel")}
            disabled={!!exporting}
            variant="outline" 
            className="h-10 border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all gap-2"
          >
            {exporting === "excel" ? <Loader2 className="size-3.5 animate-spin" /> : <FileSpreadsheet className="size-3.5" />}
            Export Excel
          </Button>
          <Button 
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            variant="outline" 
            className="h-10 border-rose-500/20 bg-rose-500/5 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-all gap-2"
          >
            {exporting === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            Download PDF
          </Button>
          <Button 
            onClick={() => handleExport("word")}
            disabled={!!exporting}
            variant="outline" 
            className="h-10 border-blue-500/20 bg-blue-500/5 text-blue-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/10 transition-all gap-2"
          >
            {exporting === "word" ? <Loader2 className="size-3.5 animate-spin" /> : <FileText className="size-3.5" />}
            Export Word
          </Button>
        </div>
      </div>

      {/* Main 2-Column Auditing Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Report Type Sidebar Selector */}
        <div 
          className="space-y-6 lg:col-span-1 overflow-y-auto max-h-[calc(100vh-260px)] pr-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {REPORT_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <p className="text-[9px] uppercase tracking-wider text-brass font-bold font-display opacity-85 px-3">
                {section.group}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-start gap-3 p-3 rounded text-left transition-all border",
                        isSelected 
                          ? "bg-brass/10 border-brass/30 text-brass dark:text-white font-bold" 
                          : "bg-white/[0.01] border-slate-200 dark:border-white/5 text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white"
                      )}
                    >
                      <Icon className={cn("size-4 mt-0.5 shrink-0", isSelected ? "text-brass" : "text-muted-foreground")} />
                      <div>
                        <p className="text-xs font-bold font-sans tracking-wide leading-none mb-1">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight italic">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Filters, Summaries, and Interactive Data Tables */}
        <div className="lg:col-span-3 space-y-6">

          {/* Dynamic Extra Filter Bar (Tab Specific) */}
          {(activeTab === "stock_valuation" || activeTab === "dead_stock") && (
            <Card className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3">
                {activeTab === "stock_valuation" && (
                  <>
                    <span className="text-xs text-muted-foreground">Select Costing Valuation Model:</span>
                    <select
                      value={costingMethod}
                      onChange={(e) => setCostingMethod(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brass"
                    >
                      <option value="FIFO" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">FIFO (First-In, First-Out)</option>
                      <option value="LIFO" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">LIFO (Last-In, First-Out)</option>
                      <option value="AVERAGE" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Weighted Average Cost</option>
                    </select>
                  </>
                )}

                {activeTab === "dead_stock" && (
                  <>
                    <span className="text-xs text-muted-foreground">Inactive Period Threshold:</span>
                    <select
                      value={deadDays}
                      onChange={(e) => setDeadDays(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-brass"
                    >
                      <option value="30" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">More than 30 Days Inactive</option>
                      <option value="60" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">More than 60 Days Inactive</option>
                      <option value="90" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">More than 90 Days Inactive</option>
                    </select>
                  </>
                )}
              </div>
              <span className="text-[10px] text-brass/80 italic font-serif">Valuations calculate live raw ingredients and BOM assemblies</span>
            </Card>
          )}

          {/* Summary Cards View (Only loaded when summary aggregates exist) */}
          {!loadingReport && reportData?.summary && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(reportData.summary).map(([key, val]) => {
                if (key === "item_count" || key === "loss_incident_count" || key === "variance_count" || key === "dead_item_count" || key === "reorder_item_count" || key === "low_stock_count") {
                  return (
                    <Card key={key} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                      <CardContent className="p-5">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Items Tracked</p>
                        <p className="text-2xl font-display text-slate-800 dark:text-white font-mono">{Number(val).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 italic font-serif">Total active auditing records in this context</p>
                      </CardContent>
                    </Card>
                  );
                }
                if (key.includes("value") || key.includes("sales") || key.includes("valuation") || key.includes("cost") || key.includes("capital")) {
                  return (
                    <Card key={key} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 bg-gradient-to-br from-brass/5 to-transparent shadow-sm dark:shadow-none">
                      <CardContent className="p-5">
                        <p className="text-[10px] uppercase tracking-widest text-brass font-bold mb-1">
                          {key.replace("total_", "").replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-2xl font-display text-brass font-mono">{formatKES(Number(val))}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 italic font-serif">Financial valuation aggregate at local currency</p>
                      </CardContent>
                    </Card>
                  );
                }
                if (key === "total_quantity" || key === "total_transactions") {
                  return (
                    <Card key={key} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                      <CardContent className="p-5">
                        <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">
                          {key.replace("total_", "").replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-2xl font-display text-emerald-400 font-mono">{Number(val).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground mt-2 italic font-serif">Total inventory quantities or transaction volume count</p>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })}
            </div>
          )}

          {/* Interactive Data Table Card */}
          <Card 
            id="report-export-container" 
            className={cn(
              "border shadow-sm dark:shadow-none transition-all duration-300",
              isGeneratingPDF 
                ? "bg-white text-slate-900 border-slate-300 p-8" 
                : "bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5"
            )}
          >
            {/* Dynamic Reusable Premium Corporate Print Header */}
            <div
              className="pb-6 mb-6 border-b-2 border-slate-800 text-slate-800 space-y-4"
              style={{ display: isGeneratingPDF ? '' : 'none' }}
            >
                <div className="flex items-start justify-between">
                  <div className="text-left space-y-1">
                    <h1 className="text-3xl font-extrabold uppercase tracking-widest text-slate-900 font-sans">
                      {company?.name || "NAKURU BUSINESS CENTER"}
                    </h1>
                    <p className="text-xs font-serif italic text-slate-600">
                      "Operations & Financial Analytics Intelligence Hub"
                    </p>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 font-mono space-y-0.5">
                    <p className="font-bold text-slate-700">{company?.primary_address || "101 Nakuru Plaza, Kenyatta Ave"}</p>
                    <p>PIN/TIN: {company?.tax_id || "PIN-KRA011082"}</p>
                    <p>Email: {company?.email || "info@faharinexus.com"}</p>
                    <p>Tel: {company?.phone_number || "+254 700 000 000"}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-100 p-2 rounded">
                  <span>Audit Stream: {reportData?.report_name || "General Ledger Report"}</span>
                  <span>Branch: {branches?.find((b: any) => b.id === Number(branchId))?.name || "All Branches"}</span>
                  <span>Staff: {profile?.user?.first_name || "Administrator"} {profile?.user?.last_name || ""}</span>
                  <span>Date: {new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

            <CardHeader className="border-b border-slate-100 dark:border-white/5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass">
                {reportData?.report_name || "System Report Data"}
              </CardTitle>
              <CardDescription className="text-xs italic font-serif">
                Dynamic auditing spreadsheet for {activeTab.replace("_", " ")}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingReport ? (
                <div className="h-96 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="size-8 animate-spin text-brass" />
                  <p className="text-xs text-muted-foreground italic font-serif">Compiling multi-warehouse database records...</p>
                </div>
              ) : (
                <div className={cn(
                  "relative",
                  isGeneratingPDF ? "overflow-visible" : "overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]"
                )}>
                  <Table>
                    <TableHeader className={cn(
                      "sticky top-0 z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]",
                      isGeneratingPDF 
                        ? "bg-slate-100 text-slate-900 border-b border-slate-300" 
                        : "bg-slate-50 dark:bg-slate-900/95 backdrop-blur-sm"
                    )}>
                      <TableRow className={cn(
                        "hover:bg-transparent",
                        isGeneratingPDF ? "border-slate-300" : "border-slate-100 dark:border-white/5"
                      )}>
                        {reportData?.data && reportData.data.length > 0 ? (
                          Object.keys(reportData.data[0]).map((key) => {
                            const isNumeric = ["quantity", "cost_price", "selling_price", "total_value", "total_sales", "total_cost", "total_retail", "unit_cost", "total_valuation", "calculated_unit_cost", "estimated_cost", "tied_capital", "portions_sold", "expected_usage", "actual_usage", "variance", "variance_cost", "total_loss_value"].includes(key.toLowerCase());
                            return (
                              <TableHead 
                                key={key} 
                                className={cn(
                                  "text-[10px] uppercase tracking-widest font-bold h-12",
                                  isNumeric ? "text-right" : "text-left",
                                  isGeneratingPDF ? "text-slate-800" : "text-slate-500 dark:text-slate-400"
                                )}
                              >
                                {key.replace("_", " ")}
                              </TableHead>
                            );
                          })
                        ) : (
                          <TableHead className="text-left text-[10px] uppercase tracking-widest font-bold h-12">Report Output</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData?.data && reportData.data.length > 0 ? (
                        reportData.data.map((row: any, rIdx: number) => (
                          <TableRow 
                            key={rIdx} 
                            className={cn(
                              "transition-colors",
                              isGeneratingPDF 
                                ? "border-slate-200 hover:bg-slate-50 text-slate-900" 
                                : "border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                            )}
                          >
                            {Object.entries(row).map(([key, val]: [string, any], cIdx: number) => {
                              const isNumeric = ["quantity", "cost_price", "selling_price", "total_value", "total_sales", "total_cost", "total_retail", "unit_cost", "total_valuation", "calculated_unit_cost", "estimated_cost", "tied_capital", "portions_sold", "expected_usage", "actual_usage", "variance", "variance_cost", "total_loss_value"].includes(key.toLowerCase());
                              
                              return (
                                <TableCell 
                                  key={cIdx} 
                                  className={cn(
                                    "text-xs font-sans",
                                    isGeneratingPDF ? "text-slate-900 border-slate-200" : "text-slate-800 dark:text-white",
                                    isNumeric ? "text-right font-mono" : "text-left"
                                  )}
                                >
                                  {isNumeric ? (
                                    ["price", "value", "cost", "sales", "valuation", "capital"].some(x => key.toLowerCase().includes(x)) ? (
                                      <span className={cn(
                                        isGeneratingPDF 
                                          ? (key.toLowerCase().includes("variance_cost") && Number(val) > 0 ? "text-rose-700 font-extrabold" : "text-emerald-700 font-extrabold")
                                          : (key.toLowerCase().includes("variance_cost") && Number(val) > 0 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold")
                                      )}>
                                        {formatKES(Number(val))}
                                      </span>
                                    ) : (
                                      Number(val).toLocaleString()
                                    )
                                  ) : (
                                    // Custom styling for status or type fields
                                    key.toLowerCase() === "product_type" ? (
                                      <Badge className={cn("text-[8px] h-4 uppercase tracking-[0.05em] px-1 border-0 flex items-center justify-center max-w-[80px]", 
                                        val === 'menu_item' ? "bg-brass/25 text-brass" :
                                        val === 'raw_material' ? "bg-sky-500/20 text-sky-400" :
                                        val === 'service' ? "bg-purple-500/20 text-purple-400" : "bg-emerald-500/20 text-emerald-400"
                                      )}>
                                        {val === 'menu_item' ? "Prepared" :
                                         val === 'raw_material' ? "Ingredient" :
                                         val === 'service' ? "Service" : "Retail"}
                                      </Badge>
                                    ) : key.toLowerCase() === "expiry_status" ? (
                                      <Badge className={cn("text-[8px] h-4 uppercase tracking-[0.05em] px-1 border-0 flex items-center justify-center max-w-[120px]", 
                                        val === 'Expired' ? "bg-rose-500/25 text-rose-400" :
                                        val.includes('Near') ? "bg-amber-500/20 text-amber-400" :
                                        val.includes('Approaching') ? "bg-orange-500/20 text-orange-400" : "bg-emerald-500/20 text-emerald-400"
                                      )}>
                                        {val}
                                      </Badge>
                                    ) : key.toLowerCase().includes("date") && typeof val === "string" && val.includes("-") ? (
                                      formatReportDate(val)
                                    ) : (
                                      String(val)
                                    )
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center py-24">
                            <CheckCircle2 className="size-12 text-emerald-500/25 mx-auto mb-3" />
                            <p className="text-sm font-medium text-emerald-400">Auditing Check Completed</p>
                            <p className="text-xs text-muted-foreground mt-1 italic">No outstanding discrepancies or entries matched for this context.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {/* Dynamic Reusable Premium Corporate Print Footer */}
            <div
              className="pt-4 mt-6 border-t border-slate-300 text-center text-[9px] uppercase tracking-widest text-slate-400 bg-slate-50 p-3 rounded-b"
              style={{ display: isGeneratingPDF ? '' : 'none' }}
            >
                This document is a system-generated official audit compiled by {company?.name || "FAHARI NEXUS ERP"}. Confidential & Proprietary.
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
