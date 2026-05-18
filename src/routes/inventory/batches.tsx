import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Filter, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingDown,
  ChevronRight,
  ArrowRight,
  MoreVertical,
  History,
  ShieldCheck,
  Zap,
  Bell
} from "lucide-react";
import { useBatches, useBatchAnalytics, useApproveBatch, useRejectBatch } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/inventory/batches")({
  component: BatchControlCenter,
});

function BatchControlCenter() {
  const [search, setSearch] = useState("");
  const { data: batchesData, isLoading: batchesLoading } = useBatches();
  const { data: analyticsData, isLoading: analyticsLoading } = useBatchAnalytics();
  const approveBatch = useApproveBatch();
  const rejectBatch = useRejectBatch();

  const batches = useMemo(() => {
    if (!batchesData) return [];
    if (Array.isArray(batchesData)) return batchesData;
    return batchesData.results || [];
  }, [batchesData]);

  const analytics = analyticsData || { summary: {}, alerts: [] };

  const filteredBatches = useMemo(() => {
    return batches.filter((b: any) => 
      b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
      b.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.sku?.toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'REJECTED': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getExpiryLabel = (dateStr: string) => {
    if (!dateStr) return { label: 'No Expiry', color: 'text-slate-400 bg-slate-400/5' };
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { label: 'Expired', color: 'text-rose-500 bg-rose-500/10' };
    if (diff <= 30) return { label: `${diff} Days`, color: 'text-amber-500 bg-amber-500/10' };
    return { label: `${diff} Days`, color: 'text-emerald-500 bg-emerald-500/10' };
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-background min-h-screen text-foreground transition-colors duration-500">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-foreground flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
               <Zap className="size-6" />
            </div>
            Batch Control Center
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            Real-time Expiry Intelligence & Multi-Batch Tracking
          </p>
        </div>
        
        <div className="flex gap-4">
           <Button variant="outline" className="bg-card/50 border-border text-foreground hover:bg-brass hover:text-navy transition-all gap-2 text-[10px] font-bold uppercase tracking-widest h-11 px-6">
             <History className="size-4" />
             Movement Logs
           </Button>
           <Button className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20">
             <Plus className="size-4 mr-2" />
             New QC Record
           </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Batches", value: analytics.summary.total_alerts + batches.length, icon: Package, color: "text-blue-500", desc: "Active across branches" },
          { title: "Expired Risks", value: analytics.summary.expired_count, icon: ShieldAlert, color: "text-rose-500", desc: "Immediate disposal required" },
          { title: "Near Expiry", value: analytics.summary.near_expiry_count, icon: AlertTriangle, color: "text-amber-500", desc: "Expires within 30 days" },
          { title: "Low Stock Alerts", value: analytics.summary.low_stock_count, icon: TrendingDown, color: "text-brass", desc: "Critically low depletion" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border overflow-hidden group hover:border-brass/30 transition-all duration-500 shadow-xl shadow-navy/5">
            <CardContent className="p-6">
               <div className="flex items-center justify-between mb-4">
                 <div className={cn("p-2 rounded-lg bg-muted border border-border", stat.color)}>
                    <stat.icon className="size-5" />
                 </div>
                 <Badge variant="outline" className="bg-muted text-[9px] border-border text-foreground">LIVE</Badge>
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                 <div className="flex items-baseline gap-2">
                   <h3 className="text-3xl font-display text-foreground">{analyticsLoading ? <Skeleton className="h-8 w-12 bg-muted" /> : stat.value}</h3>
                   <span className="text-[9px] text-muted-foreground font-medium">Items</span>
                 </div>
                 <p className="text-[10px] text-muted-foreground italic pt-2 border-t border-border mt-2">{stat.desc}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Batch Table */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Search Batch ID, Product, or SKU..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 bg-card/50 border-border focus:border-brass/50 rounded-xl text-xs"
                />
              </div>
               <div className="flex gap-2">
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-xl bg-card/50 border-border hover:bg-muted text-muted-foreground transition-all">
                    <Filter className="size-4" />
                  </Button>
                  <Button variant="outline" className="h-12 w-12 p-0 rounded-xl bg-card/50 border-border hover:bg-muted text-muted-foreground transition-all">
                    <Calendar className="size-4" />
                  </Button>
               </div>
           </div>

           <div className="rounded-3xl border border-border bg-card/40 overflow-hidden backdrop-blur-sm shadow-2xl shadow-navy/5">
             <Table>
               <TableHeader className="bg-muted/30">
                 <TableRow className="border-border hover:bg-transparent">
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold h-14">Batch Reference</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold h-14">Product Entity</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold h-14">Expiry Health</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold h-14">QC Status</TableHead>
                   <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold h-14">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {batchesLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-border">
                         <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-muted" /></TableCell>
                      </TableRow>
                   ))
                 ) : filteredBatches.map((batch: any) => {
                   const expiry = getExpiryLabel(batch.expiry_date);
                   return (
                    <TableRow key={batch.id} className="border-border hover:bg-muted/40 group transition-all duration-300">
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-mono text-brass font-bold tracking-tight">{batch.batch_number}</span>
                           <span className="text-[9px] text-muted-foreground uppercase tracking-widest">MFG: {batch.manufacturing_date}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors">
                               <Package className="size-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-foreground">{batch.product_name}</span>
                              <span className="text-[9px] text-muted-foreground font-mono">{batch.sku}</span>
                            </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1">
                           <Badge variant="outline" className={cn("w-fit text-[9px] font-bold px-2 py-0.5 rounded-full border-none", expiry.color)}>
                             {expiry.label}
                           </Badge>
                           <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-brass/40" style={{ width: '65%' }} />
                           </div>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-bold border-border", getStatusColor(batch.quality_status))}>
                          {batch.quality_status || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground">
                              <MoreVertical className="size-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground w-40">
                             <DropdownMenuItem 
                               onClick={() => approveBatch.mutate(batch.id, { onSuccess: () => toast.success("Batch approved successfully!") })}
                               className="text-[10px] uppercase font-bold tracking-widest gap-2 focus:bg-brass focus:text-navy cursor-pointer"
                             >
                                <ShieldCheck className="size-3.5" /> Approve Batch
                             </DropdownMenuItem>
                             <DropdownMenuItem 
                               onClick={() => rejectBatch.mutate(batch.id, { onSuccess: () => toast.success("Batch rejected successfully!") })}
                               className="text-[10px] uppercase font-bold tracking-widest gap-2 focus:bg-rose-500 focus:text-white cursor-pointer"
                             >
                                <ShieldAlert className="size-3.5" /> Flag Issue
                             </DropdownMenuItem>
                             <DropdownMenuItem className="text-[10px] uppercase font-bold tracking-widest gap-2 focus:bg-muted cursor-pointer">
                                <History className="size-3.5" /> View Movements
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                   )
                 })}
               </TableBody>
             </Table>
           </div>
        </div>

        {/* Real-time Alerts Sidebar */}
        <div className="space-y-6">
           <Card className="bg-card border-brass/20 shadow-2xl shadow-brass/5">
             <CardHeader className="border-b border-border bg-muted/30">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-brass flex items-center justify-between">
                   Live Alert Engine
                   <Bell className="size-4 animate-pulse" />
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
               <ScrollArea className="h-[500px]">
                 <div className="divide-y divide-border">
                    {analytics.alerts.length === 0 ? (
                      <div className="p-8 text-center space-y-3">
                         <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No Critical Threats</p>
                      </div>
                    ) : analytics.alerts.map((alert: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
                         <div className="flex gap-3">
                            <div className={cn(
                              "size-8 rounded-lg flex items-center justify-center shrink-0 border border-border",
                              alert.type === 'expired' ? "bg-rose-500/10 text-rose-500" : 
                              alert.type === 'near_expiry' ? "bg-amber-500/10 text-amber-500" : "bg-brass/10 text-brass"
                            )}>
                               {alert.type === 'expired' ? <ShieldAlert className="size-4" /> : 
                                alert.type === 'near_expiry' ? <AlertTriangle className="size-4" /> : <TrendingDown className="size-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                               <p className="text-[11px] font-bold text-foreground leading-snug group-hover:text-brass transition-colors">{alert.message}</p>
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">{alert.product}</span>
                                  <ChevronRight className="size-2.5 text-muted-foreground" />
                                  <span className="text-[9px] text-muted-foreground font-mono">{alert.batch || alert.branch}</span>
                               </div>
                            </div>
                            <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x--2 group-hover:translate-x-0" />
                         </div>
                      </div>
                    ))}
                 </div>
               </ScrollArea>
             </CardContent>
             <div className="p-4 border-t border-border bg-muted/20 text-center">
                <Button variant="link" className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-brass transition-all">
                   Configure Thresholds
                </Button>
             </div>
           </Card>

           <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                 <ShieldCheck className="size-4" />
                 Smart Engine Tip
              </h4>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-200/60 leading-relaxed italic">
                 Products like Bread have a high-risk profile. We recommend setting a 2-day buffer for near-expiry alerts on these categories.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
