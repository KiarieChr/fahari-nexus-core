import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Package, 
  CheckCircle2, 
  Calendar,
  Layers,
  AlertCircle,
  Truck
} from "lucide-react";
import { useReceivePurchase } from "@/lib/api-hooks";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PurchaseReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase: any;
}

export function PurchaseReceiptDialog({ open, onOpenChange, purchase }: PurchaseReceiptDialogProps) {
  const [items, setItems] = useState<any[]>([]);
  const receiveMutation = useReceivePurchase();

  // Initialize items when dialog opens
  useState(() => {
    if (purchase?.items) {
      setItems(purchase.items.map((item: any) => ({
        ...item,
        received_quantity: item.quantity,
        batch_number: "",
        manufacturing_date: new Date().toISOString().split('T')[0],
        expiry_date: ""
      })));
    }
  });

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleReceive = async () => {
    try {
      await receiveMutation.mutateAsync({
        id: purchase.id,
        items: items.map(i => ({
          id: i.id,
          received_quantity: i.received_quantity,
          batch_number: i.batch_number,
          manufacturing_date: i.manufacturing_date,
          expiry_date: i.expiry_date
        }))
      });
      toast.success("Purchase order received and stock updated!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process receipt.");
    }
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[#0A0D14] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
             <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Truck className="size-6" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-display text-white">Receive Goods (GRN)</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                   PO: <span className="text-brass">{purchase.po_number}</span> • Supplier: <span className="text-brass">{purchase.supplier_name}</span>
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8">
           <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
              <ScrollArea className="h-[400px]">
                 <Table>
                    <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                       <TableRow className="border-white/5">
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest">Product</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest w-24 text-center">Ordered</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest w-24 text-center">Received</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest w-40">Batch #</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest w-40">MFG Date</TableHead>
                          <TableHead className="text-[10px] uppercase font-bold tracking-widest w-40">EXP Date</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {items.map((item) => (
                         <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                            <TableCell>
                               <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">{item.product_name}</span>
                                  <span className="text-[9px] text-muted-foreground font-mono">{item.product_sku}</span>
                               </div>
                            </TableCell>
                            <TableCell className="text-center font-bold text-muted-foreground">{item.quantity}</TableCell>
                            <TableCell>
                               <Input 
                                 type="number" 
                                 className="h-9 text-center bg-white/5 border-white/10 rounded-lg"
                                 value={item.received_quantity}
                                 onChange={(e) => updateItem(item.id, 'received_quantity', Number(e.target.value))}
                               />
                            </TableCell>
                            <TableCell>
                               <Input 
                                 placeholder="BATCH-XXX"
                                 className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                                 value={item.batch_number}
                                 onChange={(e) => updateItem(item.id, 'batch_number', e.target.value)}
                               />
                            </TableCell>
                            <TableCell>
                               <Input 
                                 type="date"
                                 className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                                 value={item.manufacturing_date}
                                 onChange={(e) => updateItem(item.id, 'manufacturing_date', e.target.value)}
                               />
                            </TableCell>
                            <TableCell>
                               <div className="space-y-1">
                                  <Input 
                                    type="date"
                                    className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                                    value={item.expiry_date}
                                    onChange={(e) => updateItem(item.id, 'expiry_date', e.target.value)}
                                  />
                                  <p className="text-[8px] text-muted-foreground uppercase text-center italic">Leave blank for auto-calc</p>
                               </div>
                            </TableCell>
                         </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </ScrollArea>
           </div>

           <div className="mt-8 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-4">
              <AlertCircle className="size-6 text-blue-400 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-sm font-bold text-white uppercase tracking-widest">Inventory Synchronization</h4>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                    Confirming this receipt will automatically create the batches and update stock levels at the primary branch. 
                    If shelf-life is configured for a product, the expiry date will be calculated based on the manufacturing date provided.
                 </p>
              </div>
           </div>
        </div>

        <DialogFooter className="p-8 bg-white/[0.01] border-t border-white/5">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-bold uppercase tracking-widest h-12 px-6">
              Cancel
           </Button>
           <Button 
             className="bg-emerald-500 text-navy font-bold uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
             onClick={handleReceive}
             disabled={receiveMutation.isPending}
           >
              {receiveMutation.isPending ? "Processing..." : "Confirm & Update Stock"}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
