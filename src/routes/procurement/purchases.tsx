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
import { PurchaseOrderDialog } from "@/components/procurement/PurchaseOrderDialog";
 
export const Route = createFileRoute("/procurement/purchases")({
  component: PurchasesPage,
});
 
function PurchasesPage() {
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isGRNOpen, setIsGRNOpen] = useState(false);
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const { data: purchasesData, isLoading } = usePurchases();
  const { data: company } = useCompany();
  const { data: settings } = useInventorySettings();
 
  const enableComplex = settings ? !settings.enable_simple_stockin : false;
  const purchases = Array.isArray(purchasesData) ? purchasesData : purchasesData?.results || [];

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
    <div className="flex-1 space-y-8 p-8 pt-6 bg-background min-h-screen text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-foreground flex items-center gap-4">
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
            <Button variant="outline" className="border-border bg-card text-[10px] font-bold uppercase tracking-widest h-11 px-6 hover:bg-muted text-foreground">
              <FileText className="size-4 mr-2" />
              Manage RFQs
            </Button>
          )}
          <Button 
            className="bg-navy text-white font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-navy/90 transition-all shadow-lg shadow-navy/20"
            onClick={() => setIsPODialogOpen(true)}
          >
            <Plus className="size-4 mr-2" />
            New Purchase Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
         {[
           { label: "Ordered Value", value: `KES ${purchases.filter((p:any) => p.status === 'ordered').reduce((acc:any, p:any) => acc + Number(p.total), 0).toLocaleString()}`, icon: Tag, color: "text-blue-500" },
           { label: "Pending Deliveries", value: purchases.filter((p:any) => p.status === 'ordered').length, icon: Truck, color: "text-amber-500" },
           { label: "Total Received", value: purchases.filter((p:any) => p.status === 'received').length, icon: CheckCircle2, color: "text-emerald-500" },
           { label: "Draft POs", value: purchases.filter((p:any) => p.status === 'draft').length, icon: FileText, color: "text-slate-500" },
         ].map((stat, i) => (
           <Card key={i} className="bg-card border-border group hover:border-brass/40 transition-all">
             <CardContent className="p-6 flex items-center gap-4">
                <div className={cn("size-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border", stat.color)}>
                   <stat.icon className="size-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                   <h3 className="text-2xl font-display text-foreground">{stat.value}</h3>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>

      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
         <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-4 flex-1 max-w-md">
               <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter by PO # or Supplier..." 
                    className="pl-10 bg-background border-border h-10 rounded-xl text-xs"
                  />
               </div>
               <Button variant="outline" size="icon" className="border-border bg-background h-10 w-10">
                  <Filter className="size-4" />
               </Button>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Active
               </Button>
               <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  All History
               </Button>
            </div>
         </div>

         <Table>
            <TableHeader className="bg-muted/30">
               <TableRow className="border-border">
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
                    <TableRow key={i} className="border-border">
                       <TableCell colSpan={5}><Skeleton className="h-12 w-full bg-muted" /></TableCell>
                    </TableRow>
                  ))
               ) : purchases.map((purchase: any) => (
                 <TableRow key={purchase.id} className="border-border hover:bg-muted/20 transition-colors">
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground uppercase tracking-tighter">#{purchase.po_number}</span>
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground uppercase font-bold mt-1">
                             <Calendar className="size-3" />
                             {new Date(purchase.order_date).toLocaleDateString()}
                          </div>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-muted/50 flex items-center justify-center border border-border">
                             <Building2 className="size-4 text-brass" />
                          </div>
                          <span className="text-[11px] font-bold text-foreground">{purchase.supplier_name}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">KES {Number(purchase.total).toLocaleString()}</span>
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
                           className="bg-emerald-600 text-white text-[10px] font-bold uppercase h-8 px-4 hover:bg-emerald-700"
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

      <PurchaseOrderDialog 
        isOpen={isPODialogOpen} 
        onOpenChange={setIsPODialogOpen} 
      />
    </div>
  );
}
