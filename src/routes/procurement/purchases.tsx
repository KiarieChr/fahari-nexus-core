import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  CheckCircle2, 
  Clock,
  ArrowRight,
  Truck,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  Building2,
  Tag
} from "lucide-react";
import { usePurchases, useCompany, useInventorySettings } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { SimpleReceiveDialog } from "@/components/inventory/SimpleReceiveDialog";
import { GRNCreateDialog } from "@/components/procurement/GRNCreateDialog";
 
export const Route = createFileRoute("/procurement/purchases")({
  component: PurchasesPage,
});
 
function PurchasesPage() {
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isGRNOpen, setIsGRNOpen] = useState(false);
  const { data: purchasesData, isLoading } = usePurchases();
  const { data: company } = useCompany();
  const { data: settings } = useInventorySettings();
 
  const enableComplex = settings ? !settings.enable_simple_stockin : false;
  const purchases = purchasesData?.results || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'ordered': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'draft': return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
      case 'cancelled': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const handleOpenReceive = (purchase: any) => {
    setSelectedPurchase(purchase);
    if (enableComplex) {
      setIsGRNOpen(true);
    } else {
      setIsReceiptOpen(true);
    }
  };

  const handleQuickStockIn = () => {
    setSelectedPurchase(null);
    setIsReceiptOpen(true);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#0A0D14] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
               <ShoppingBag className="size-6" />
            </div>
            Procurement
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            Purchase Orders & Supplier Deliveries
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!enableComplex && (
            <Button 
              variant="outline" 
              className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest h-11 px-6 hover:bg-emerald-500/10"
              onClick={handleQuickStockIn}
            >
              <Truck className="size-4 mr-2" />
              Quick Stock In
            </Button>
          )}
          {enableComplex && (
            <Button variant="outline" className="border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest h-11 px-6 hover:bg-white/10 text-white">
              <FileText className="size-4 mr-2" />
              Manage RFQs
            </Button>
          )}
          <Button className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20">
            <Plus className="size-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         {[
           { label: "Ordered Value", value: `$${purchases.filter((p:any) => p.status === 'ordered').reduce((acc:any, p:any) => acc + Number(p.total), 0).toLocaleString()}`, icon: Tag, color: "text-blue-500" },
           { label: "Pending Deliveries", value: purchases.filter((p:any) => p.status === 'ordered').length, icon: Truck, color: "text-amber-500" },
           { label: "Total Received", value: purchases.filter((p:any) => p.status === 'received').length, icon: CheckCircle2, color: "text-emerald-500" },
           { label: "Draft POs", value: purchases.filter((p:any) => p.status === 'draft').length, icon: FileText, color: "text-slate-500" },
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
         <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-4 flex-1 max-w-md">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter by PO # or Supplier..." 
                    className="pl-10 bg-white/5 border-white/10 h-10 rounded-xl text-xs"
                  />
               </div>
               <Button variant="outline" size="icon" className="border-white/10 bg-white/5 h-10 w-10">
                  <Filter className="size-4" />
               </Button>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                  Active
               </Button>
               <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">
                  All History
               </Button>
            </div>
         </div>

         <Table>
            <TableHeader className="bg-white/[0.01]">
               <TableRow className="border-white/5">
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">PO Details</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Supplier</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Order Value</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                       <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                    </TableRow>
                  ))
               ) : purchases.map((purchase: any) => (
                 <TableRow key={purchase.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-white uppercase tracking-tighter">#{purchase.po_number}</span>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-bold mt-1">
                             <Calendar className="size-3" />
                             {new Date(purchase.order_date).toLocaleDateString()}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                             <Building2 className="size-4 text-brass" />
                          </div>
                          <span className="text-[11px] font-bold text-white">{purchase.supplier_name}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">${Number(purchase.total).toLocaleString()}</span>
                          <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{purchase.items?.length || 0} Products</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border-none uppercase tracking-widest", getStatusColor(purchase.status))}>
                          {purchase.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {purchase.status === 'ordered' ? (
                         <Button 
                           size="sm" 
                           className="bg-emerald-500 text-navy text-[10px] font-bold uppercase h-8 px-4 hover:bg-emerald-400"
                           onClick={() => handleOpenReceive(purchase)}
                         >
                            <Truck className="size-3 mr-2" />
                            {enableComplex ? "Process Delivery" : "Receive"}
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

      <SimpleReceiveDialog 
        open={isReceiptOpen} 
        onOpenChange={setIsReceiptOpen} 
        purchase={selectedPurchase}
      />

      <GRNCreateDialog 
        open={isGRNOpen} 
        onOpenChange={setIsGRNOpen}
        prefillPurchase={selectedPurchase}
      />
    </div>
  );
}
