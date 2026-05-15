import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Truck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Clock,
  Plus,
  MoreVertical,
  ChevronRight,
  MapPin,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  History,
  FileText
} from "lucide-react";
import { useTransfers, useMovements, useDispatchTransfer, useMovementAnalytics } from "@/lib/api-hooks";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { StockTransferRequestDialog } from "@/components/inventory/StockTransferRequestDialog";
import { 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  ArrowUp, 
  ArrowDown,
  Activity,
  BarChart3
} from "lucide-react";

export const Route = createFileRoute("/inventory/transfers")({
  component: StockTransfersPage,
});

function StockTransfersPage() {
  const [activeTab, setActiveTab] = useState("transfers");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: transfersData, isLoading: transfersLoading } = useTransfers();
  const { data: movementsData, isLoading: movementsLoading } = useMovements();
  const { data: analyticsData } = useMovementAnalytics();
  const dispatchMutation = useDispatchTransfer();

  const transfers = transfersData?.results || [];
  const movements = movementsData?.results || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'IN_TRANSIT': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'PENDING': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CANCELLED': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const handleDispatch = async (id: number) => {
    try {
      await dispatchMutation.mutateAsync(id);
      toast.success("Stock dispatched successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to dispatch stock.");
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#030711] min-h-screen text-white">
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
               <ArrowRightLeft className="size-6" />
            </div>
            Stock Logistics
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            Inter-Branch Transfers & Global Movement Ledger
          </p>
        </div>
        
        <Button 
          className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          Initiate Transfer
        </Button>
      </div>

      <StockTransferRequestDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      <Tabs defaultValue="transfers" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="transfers" className="rounded-lg data-[state=active]:bg-brass data-[state=active]:text-navy text-[10px] uppercase font-bold tracking-widest px-6 py-2">
            Active Transfers
          </TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-lg data-[state=active]:bg-brass data-[state=active]:text-navy text-[10px] uppercase font-bold tracking-widest px-6 py-2">
            Movement Ledger
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-brass data-[state=active]:text-navy text-[10px] uppercase font-bold tracking-widest px-6 py-2">
            Movement Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
             {[
               { label: "Pending Orders", value: transfers.filter((t:any) => t.status === 'PENDING').length, icon: Clock, color: "text-amber-500" },
               { label: "In Transit", value: transfers.filter((t:any) => t.status === 'IN_TRANSIT').length, icon: Truck, color: "text-blue-500" },
               { label: "Completed Today", value: transfers.filter((t:any) => t.status === 'COMPLETED').length, icon: CheckCircle2, color: "text-emerald-500" },
             ].map((stat, i) => (
               <Card key={i} className="bg-white/[0.02] border-white/5 group hover:border-white/10 transition-all">
                 <CardContent className="p-6 flex items-center gap-4">
                    <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5", stat.color)}>
                       <stat.icon className="size-5" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                       <h3 className="text-2xl font-display text-white">{stat.value}</h3>
                    </div>
                 </CardContent>
               </Card>
             ))}
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
             <Table>
               <TableHeader className="bg-white/[0.02]">
                 <TableRow className="border-white/5">
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Transfer Ref</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Logistics Route</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Volume</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Status</TableHead>
                   <TableHead className="text-right text-[10px] uppercase tracking-widest font-bold">Actions</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {transfersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                         <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                      </TableRow>
                    ))
                 ) : transfers.map((transfer: any) => (
                   <TableRow key={transfer.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                     <TableCell>
                        <div className="flex flex-col">
                           <span className="text-[11px] font-mono text-brass font-bold">{transfer.transfer_number}</span>
                           <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                             {new Date(transfer.transfer_date).toLocaleDateString()}
                           </span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex items-center gap-3">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-white">{transfer.from_branch_name}</span>
                              <span className="text-[8px] text-muted-foreground uppercase">Source</span>
                           </div>
                           <ArrowRight className="size-3 text-brass" />
                           <div className="flex flex-col items-start">
                              <span className="text-[10px] font-bold text-white">{transfer.to_branch_name}</span>
                              <span className="text-[8px] text-muted-foreground uppercase">Destination</span>
                           </div>
                        </div>
                     </TableCell>
                     <TableCell>
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-white">{transfer.total_quantity} Units</span>
                           <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{transfer.total_items} Items</span>
                        </div>
                     </TableCell>
                     <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border-none", getStatusColor(transfer.status))}>
                           {transfer.status_display}
                        </Badge>
                     </TableCell>
                     <TableCell className="text-right">
                        {transfer.status === 'APPROVED' ? (
                          <Button 
                            size="sm" 
                            className="bg-brass text-navy text-[10px] font-bold uppercase h-8 px-4"
                            onClick={() => handleDispatch(transfer.id)}
                            disabled={dispatchMutation.isPending}
                          >
                             Dispatch
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="size-4 text-muted-foreground" />
                          </Button>
                        )}
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
          </div>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
           <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
             <Table>
               <TableHeader className="bg-white/[0.02]">
                 <TableRow className="border-white/5">
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Movement ID</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Entity & Batch</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Branch</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold">Type</TableHead>
                   <TableHead className="text-[10px] uppercase tracking-widest font-bold text-right">Delta</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                  {movementsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-white/5">
                         <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                      </TableRow>
                    ))
                  ) : movements.map((mov: any) => (
                    <TableRow key={mov.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                         <span className="text-[11px] font-mono text-muted-foreground">{mov.movement_number}</span>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-white">{mov.product_name}</span>
                            <span className="text-[9px] text-brass/70 font-mono tracking-tighter">BATCH: {mov.batch_number || 'N/A'}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5">
                            <MapPin className="size-3 text-muted-foreground" />
                            <span className="text-[10px] text-white font-medium">{mov.branch_name}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <div className={cn(
                             "size-6 rounded-md flex items-center justify-center",
                             mov.movement_type.includes('IN') || mov.movement_type === 'PURCHASE' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                           )}>
                              {mov.movement_type.includes('IN') || mov.movement_type === 'PURCHASE' ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                           </div>
                           <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                             {mov.movement_type_display}
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <span className={cn(
                           "text-xs font-mono font-bold",
                           mov.movement_type.includes('IN') || mov.movement_type === 'PURCHASE' ? "text-emerald-500" : "text-rose-500"
                         )}>
                            {mov.movement_type.includes('IN') || mov.movement_type === 'PURCHASE' ? '+' : '-'}{mov.quantity}
                         </span>
                      </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
             </Table>
           </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-8">
           <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                 <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                       <TrendingUp className="size-4" /> Movement Velocity
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    {analyticsData?.top_velocity_products.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-brass transition-colors">
                               0{i+1}
                            </div>
                            <span className="text-xs font-medium text-white">{p.product__name}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-white">{p.total_moved}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Units</span>
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                 <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-500 flex items-center gap-2">
                       <AlertTriangle className="size-4" /> Adjustment Risks
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    {analyticsData?.adjustment_risks.map((adj: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                               <Zap className="size-4" />
                            </div>
                            <span className="text-xs font-medium text-white">{adj.movement_type}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-rose-500">-{adj.total_qty}</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest">Total Units</span>
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 overflow-hidden">
                 <CardHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                       <Activity className="size-4" /> Volume Split (30d)
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-6 space-y-4">
                    {analyticsData?.volume_by_type.slice(0, 5).map((vol: any, i: number) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                            <span className="text-white">{vol.movement_type}</span>
                            <span className="text-muted-foreground">{vol.count} Trans.</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${Math.min(100, (vol.total_qty / 1000) * 100)}%` }} 
                            />
                         </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>
           </div>

           <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-white/[0.02] border-white/5 p-8 flex items-center gap-6 group hover:border-brass/20 transition-all">
                 <div className="size-16 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass group-hover:scale-110 transition-transform">
                    <BarChart3 className="size-8" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-display text-white">Efficiency Report</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                       Analyze how quickly stock moves between branches to identify underperforming locations.
                    </p>
                 </div>
                 <Button variant="ghost" className="ml-auto group-hover:bg-brass group-hover:text-navy transition-colors">
                    View <ChevronRight className="size-4 ml-2" />
                 </Button>
              </Card>

              <Card className="bg-white/[0.02] border-white/5 p-8 flex items-center gap-6 group hover:border-emerald-500/20 transition-all">
                 <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="size-8" />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-display text-white">Loss Mitigation</h4>
                    <p className="text-xs text-muted-foreground max-w-[280px]">
                       Review damages and adjustments to implement preventive measures and reduce shrinkage.
                    </p>
                 </div>
                 <Button variant="ghost" className="ml-auto group-hover:bg-emerald-500 group-hover:text-navy transition-colors">
                    Analyze <ChevronRight className="size-4 ml-2" />
                 </Button>
              </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
