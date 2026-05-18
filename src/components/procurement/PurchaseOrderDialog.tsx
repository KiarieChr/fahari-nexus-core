import { useState } from "react";
import { toast } from "sonner";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Calendar,
  Building2,
  FileText,
  Loader2,
  DollarSign,
  PackageSearch,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCreatePurchase, useSuppliers, useProducts } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

interface PurchaseOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseOrderDialog({ isOpen, onOpenChange }: PurchaseOrderDialogProps) {
  const [supplierId, setSupplierId] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Array<{ product_id: number; quantity: string; unit_cost: string }>>([]);

  const createPurchase = useCreatePurchase();
  const { data: suppliersData } = useSuppliers();
  const { data: productsData } = useProducts();

  const suppliers = suppliersData?.results || suppliersData || [];
  const products = productsData?.results || productsData || [];

  const handleAddItem = () => {
    setItems([...items, { product_id: 0, quantity: "1", unit_cost: "0" }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    
    // Auto-fill unit cost when product is selected
    if (field === "product_id" && value) {
      const product = products.find((p: any) => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_cost = product.cost_price?.toString() || "0";
      }
    }
    
    setItems(newItems);
  };

  const reset = () => {
    setSupplierId("");
    setExpectedDelivery("");
    setNotes("");
    setItems([]);
    createPurchase.reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSubmit = () => {
    if (!supplierId) {
      toast.error("Please select a supplier.");
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one item.");
      return;
    }
    
    const invalidItems = items.filter(i => !i.product_id || Number(i.quantity) <= 0);
    if (invalidItems.length > 0) {
      toast.error("Please select products and valid quantities for all items.");
      return;
    }

    const payload = {
      supplier: parseInt(supplierId),
      expected_delivery: expectedDelivery || undefined,
      notes,
      items: items.map(i => ({
        product: i.product_id,
        quantity: i.quantity,
        unit_cost: i.unit_cost,
      }))
    };

    createPurchase.mutate(payload, {
      onSuccess: (data) => {
        toast.success(`Purchase Order #${data.po_number} created successfully!`);
        handleClose(false);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || "Failed to create purchase order.";
        toast.error(msg);
      },
    });
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_cost) || 0),
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl bg-[#0A0D14] border border-white/10 text-foreground p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ShoppingBag className="size-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-white">
                New Purchase Order
              </DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Create a draft PO for supplier delivery
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="px-6 py-5 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5">
                  <Building2 className="size-3" /> Supplier
                  <span className="text-rose-400">*</span>
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                >
                  <option value="" className="bg-navy">Select Supplier</option>
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id} className="bg-navy">{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5">
                  <Calendar className="size-3" /> Expected Delivery
                </label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5">
                <FileText className="size-3" /> Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes for the purchase order..."
                className="w-full min-h-[80px] p-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none"
              />
            </div>

            <Separator className="bg-white/5" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5">
                  <PackageSearch className="size-3" /> Line Items
                  <span className="text-rose-400">*</span>
                </label>
                <button
                  onClick={handleAddItem}
                  className="h-8 px-3 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-1.5"
                >
                  <Plus className="size-3" /> Add Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="h-32 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-muted-foreground">
                  <ShoppingBag className="size-6 mb-2 opacity-20" />
                  <p className="text-xs">No items added to this PO.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 px-2 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    <div>Product</div>
                    <div>Qty</div>
                    <div>Unit Cost ($)</div>
                    <div className="text-right">Line Total</div>
                    <div></div>
                  </div>
                  
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_100px_120px_100px_40px] gap-3 items-center group">
                      <select
                        value={item.product_id || ""}
                        onChange={(e) => handleItemChange(index, "product_id", parseInt(e.target.value))}
                        className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-blue-500/60 transition-all"
                      >
                        <option value="" className="bg-navy text-muted-foreground">Select Product</option>
                        {products.map((p: any) => (
                          <option key={p.id} value={p.id} className="bg-navy">{p.name}</option>
                        ))}
                      </select>
                      
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-blue-500/60 transition-all"
                      />
                      
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => handleItemChange(index, "unit_cost", e.target.value)}
                        className="h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs outline-none focus:border-blue-500/60 transition-all font-mono"
                      />
                      
                      <div className="text-right font-mono text-sm text-brass font-medium px-2">
                        ${((Number(item.quantity) || 0) * (Number(item.unit_cost) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="size-8 rounded-lg text-muted-foreground hover:bg-rose-500/10 hover:text-rose-400 flex items-center justify-center transition-all"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4 pr-[52px]">
                    <div className="bg-white/5 rounded-xl p-4 min-w-[200px] border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total Value</span>
                        <span className="text-lg font-display text-white">
                          ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </ScrollArea>

        <div className="px-6 pb-6 pt-2 border-t border-white/5 flex gap-3">
          <button
            onClick={() => handleClose(false)}
            className="flex-1 h-11 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-all text-[10px] uppercase tracking-widest font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={createPurchase.isPending}
            className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
          >
            {createPurchase.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingBag className="size-3.5" />
            )}
            Create PO
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
