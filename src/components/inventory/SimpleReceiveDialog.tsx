import { useState, useEffect } from "react";
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
  Truck, 
  Search, 
  Plus, 
  Trash2, 
  Package, 
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { useReceivePurchase, useQuickStockIn, useSuppliers, useProducts } from "@/lib/api-hooks";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimpleReceiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchase?: any; // If provided, we are receiving a PO
}

export function SimpleReceiveDialog({ open, onOpenChange, purchase }: SimpleReceiveDialogProps) {
  const [supplierId, setSupplierId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();
  
  const receiveMutation = useReceivePurchase();
  const quickStockInMutation = useQuickStockIn();

  const suppliers = suppliersData?.results || [];
  const products = productsData?.results || [];

  // Initialize items when dialog opens or purchase changes
  useEffect(() => {
    if (open) {
      if (purchase) {
        setSupplierId(String(purchase.supplier));
        setItems(purchase.items.map((item: any) => ({
          ...item,
          product_id: item.product,
          quantity: item.quantity,
          received_quantity: item.quantity,
          unit_cost: item.unit_cost,
          batch_number: "",
          manufacturing_date: new Date().toISOString().split('T')[0],
          expiry_date: ""
        })));
      } else {
        setSupplierId("");
        setItems([]);
      }
    }
  }, [open, purchase]);

  const addItem = (product: any) => {
    if (items.find(i => i.product_id === product.id)) {
      toast.error("Product already added");
      return;
    }
    setItems([...items, {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: 1,
      received_quantity: 1,
      unit_cost: product.cost_price,
      batch_number: "",
      manufacturing_date: new Date().toISOString().split('T')[0],
      expiry_date: ""
    }]);
    setSearchQuery("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleConfirm = async () => {
    if (items.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    try {
      if (purchase) {
        // Receiving an existing PO
        await receiveMutation.mutateAsync({
          id: purchase.id,
          items: items.map(i => ({
            id: i.id, // PurchaseItem ID
            received_quantity: i.received_quantity,
            batch_number: i.batch_number,
            manufacturing_date: i.manufacturing_date,
            expiry_date: i.expiry_date
          }))
        });
      } else {
        // Direct stock-in (Quick Purchase)
        if (!supplierId) {
          toast.error("Please select a supplier");
          return;
        }
        await quickStockInMutation.mutateAsync({
          supplier_id: Number(supplierId),
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.received_quantity,
            unit_cost: i.unit_cost,
            batch_number: i.batch_number,
            manufacturing_date: i.manufacturing_date,
            expiry_date: i.expiry_date
          }))
        });
      }
      toast.success(purchase ? "Purchase received successfully!" : "Stock updated successfully!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to process receipt.");
    }
  };

  const filteredProducts = searchQuery.length > 1 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const isPending = receiveMutation.isPending || quickStockInMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-[#030711] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Truck className="size-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-display text-white">
                  {purchase ? "Receive Purchase Order" : "Quick Stock-In"}
                </DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                  {purchase ? `PO: ${purchase.po_number} • ${purchase.supplier_name}` : "Direct Purchase to Inventory"}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {!purchase && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 rounded-xl">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 relative">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Add Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or SKU..." 
                    className="pl-10 bg-white/5 border-white/10 h-12 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f1d] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-60 overflow-y-auto">
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          className="w-full p-3 flex items-center justify-between hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                          onClick={() => addItem(p)}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.sku}</p>
                          </div>
                          <Plus className="size-4 text-emerald-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader className="bg-white/[0.02] sticky top-0 z-10">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest">Product</TableHead>
                    {!purchase && <TableHead className="text-[10px] uppercase font-bold tracking-widest w-32">Unit Cost</TableHead>}
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest w-24 text-center">Qty</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest w-40">Batch #</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold tracking-widest w-40">MFG / EXP</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow className="border-white/5">
                      <TableCell colSpan={purchase ? 5 : 6} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Package className="size-8 opacity-20" />
                          <p className="text-sm italic">No items added yet</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : items.map((item, index) => (
                    <TableRow key={index} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{item.product_name}</span>
                          <span className="text-[9px] text-muted-foreground font-mono">{item.product_sku}</span>
                        </div>
                      </TableCell>
                      {!purchase && (
                        <TableCell>
                          <Input 
                            type="number" 
                            className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                            value={item.unit_cost}
                            onChange={(e) => updateItem(index, 'unit_cost', Number(e.target.value))}
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Input 
                          type="number" 
                          className="h-9 text-center bg-white/5 border-white/10 rounded-lg font-bold"
                          value={item.received_quantity}
                          onChange={(e) => updateItem(index, 'received_quantity', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="BATCH-XXX"
                          className="h-9 bg-white/5 border-white/10 rounded-lg text-xs"
                          value={item.batch_number}
                          onChange={(e) => updateItem(index, 'batch_number', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Input 
                            type="date"
                            className="h-8 bg-white/5 border-white/10 rounded-lg text-[9px] p-1"
                            value={item.manufacturing_date}
                            onChange={(e) => updateItem(index, 'manufacturing_date', e.target.value)}
                          />
                          <Input 
                            type="date"
                            className="h-8 bg-white/5 border-white/10 rounded-lg text-[9px] p-1"
                            value={item.expiry_date}
                            onChange={(e) => updateItem(index, 'expiry_date', e.target.value)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {!purchase && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:bg-rose-500/10"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Confirming this receipt will automatically update stock levels and create batches. 
              {purchase ? " The purchase order will be marked as received." : " A quick purchase record will be created for tracking."}
            </p>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white/[0.01] border-t border-white/5">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-bold uppercase tracking-widest h-12 px-6">
            Cancel
          </Button>
          <Button 
            className="bg-emerald-500 text-navy font-bold uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-emerald-400 shadow-xl shadow-emerald-500/20"
            onClick={handleConfirm}
            disabled={isPending || items.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                Confirm & Stock In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
