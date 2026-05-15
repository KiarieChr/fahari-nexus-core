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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  Trash2, 
  Plus, 
  ArrowRight, 
  MapPin, 
  ClipboardCheck,
  AlertCircle
} from "lucide-react";
import { useBranches, useProducts, useCreateTransfer } from "@/lib/api-hooks";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockTransferRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StockTransferRequestDialog({ open, onOpenChange }: StockTransferRequestDialogProps) {
  const [step, setStep] = useState(1);
  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const { data: branchesData } = useBranches();
  const { data: productsData } = useProducts();
  const createMutation = useCreateTransfer();

  const branches = branchesData?.results || [];
  const products = productsData?.results || [];

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product: any) => {
    if (items.find(i => i.id === product.id)) return;
    setItems([...items, { ...product, quantity: 1, unit_cost: product.cost_price }]);
    setSearch("");
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleCreate = async () => {
    if (!fromBranch || !toBranch || items.length === 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (fromBranch === toBranch) {
      toast.error("Source and destination branches must be different.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        from_branch: fromBranch,
        to_branch: toBranch,
        status: 'PENDING',
        items: items.map(i => ({
          product: i.id,
          quantity: i.quantity,
          unit_cost: i.unit_cost
        }))
      });
      toast.success("Transfer request created successfully!");
      onOpenChange(false);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create transfer request.");
    }
  };

  const reset = () => {
    setStep(1);
    setFromBranch("");
    setToBranch("");
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#030711] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
             <div className="size-12 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
                <ArrowRight className="size-6" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-display text-white">New Stock Transfer</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                   Inter-branch stock movement workflow
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
           {/* Step Indicators */}
           <div className="flex items-center justify-between px-12">
              {[
                { id: 1, label: "Logistics Route", icon: MapPin },
                { id: 2, label: "Item Selection", icon: Package },
                { id: 3, label: "Confirmation", icon: ClipboardCheck },
              ].map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2 group relative">
                   <div className={cn(
                     "size-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                     step === s.id ? "bg-brass border-brass text-navy shadow-lg shadow-brass/20" : 
                     step > s.id ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-white/5 border-white/10 text-muted-foreground"
                   )}>
                      <s.icon className="size-5" />
                   </div>
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-widest transition-colors",
                     step === s.id ? "text-white" : "text-muted-foreground"
                   )}>{s.label}</span>
                </div>
              ))}
           </div>

           {step === 1 && (
             <div className="grid grid-cols-2 gap-8 py-4">
                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                      <ArrowLeft className="size-3.5" /> Source Branch
                   </Label>
                   <Select value={fromBranch} onValueChange={setFromBranch}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brass/50 text-white">
                         <SelectValue placeholder="Select originating branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                         {branches.map((b: any) => (
                           <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                   <p className="text-[10px] text-muted-foreground italic">Stock will be deducted from here upon dispatch.</p>
                </div>

                <div className="space-y-4 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                      Destination Branch <ArrowRight className="size-3.5" />
                   </Label>
                   <Select value={toBranch} onValueChange={setToBranch}>
                      <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brass/50 text-white">
                         <SelectValue placeholder="Select destination branch" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                         {branches.map((b: any) => (
                           <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                         ))}
                      </SelectContent>
                   </Select>
                   <p className="text-[10px] text-muted-foreground italic">Stock will be added here upon receipt.</p>
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search products by name or SKU..." 
                     className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-brass/50 text-sm"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                   {search && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <ScrollArea className="h-60">
                           {filteredProducts.map((p: any) => (
                             <div 
                               key={p.id} 
                               className="p-4 hover:bg-white/5 flex items-center justify-between cursor-pointer group transition-colors border-b border-white/5 last:border-0"
                               onClick={() => addItem(p)}
                             >
                                <div className="flex items-center gap-3">
                                   <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-brass transition-colors">
                                      <Package className="size-5" />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-white">{p.name}</p>
                                      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{p.sku}</p>
                                   </div>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-lg group-hover:bg-brass group-hover:text-navy">
                                   <Plus className="size-4" />
                                </Button>
                             </div>
                           ))}
                        </ScrollArea>
                     </div>
                   )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                   <Table>
                      <TableHeader className="bg-white/[0.02]">
                         <TableRow className="border-white/5">
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Product</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest w-32 text-center">Quantity</TableHead>
                            <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest">Action</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {items.length === 0 ? (
                           <TableRow className="hover:bg-transparent border-white/5">
                              <TableCell colSpan={3} className="h-32 text-center">
                                 <div className="space-y-2">
                                    <Package className="size-8 text-muted-foreground/30 mx-auto" />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Add items to transfer</p>
                                 </div>
                              </TableCell>
                           </TableRow>
                         ) : items.map((item) => (
                           <TableRow key={item.id} className="border-white/5">
                              <TableCell>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white">{item.name}</span>
                                    <span className="text-[9px] text-muted-foreground font-mono">{item.sku}</span>
                                 </div>
                              </TableCell>
                              <TableCell>
                                 <Input 
                                   type="number" 
                                   className="h-10 text-center bg-white/5 border-white/10 rounded-xl"
                                   value={item.quantity}
                                   onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                                 />
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
                                   onClick={() => removeItem(item.id)}
                                 >
                                    <Trash2 className="size-4" />
                                 </Button>
                              </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                   </Table>
                </div>
             </div>
           )}

           {step === 3 && (
             <div className="space-y-8 py-4">
                <div className="p-8 rounded-3xl bg-brass/5 border border-brass/20 space-y-6">
                   <div className="flex items-center justify-between text-navy-deep">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Source</p>
                         <h4 className="text-xl font-display text-white">{branches.find(b => b.id.toString() === fromBranch)?.name}</h4>
                      </div>
                      <div className="size-10 rounded-full bg-brass flex items-center justify-center text-navy shadow-lg shadow-brass/20">
                         <ArrowRight className="size-6" />
                      </div>
                      <div className="space-y-1 text-right">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Destination</p>
                         <h4 className="text-xl font-display text-white">{branches.find(b => b.id.toString() === toBranch)?.name}</h4>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/10">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                         <span>Transfer Manifest</span>
                         <span>{items.length} Items</span>
                      </div>
                      <div className="space-y-3">
                         {items.map(item => (
                           <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                              <span className="text-[11px] font-bold text-white">{item.name}</span>
                              <Badge className="bg-brass text-navy font-bold text-[10px]">{item.quantity} Units</Badge>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                   <AlertCircle className="size-5 shrink-0" />
                   <p className="text-[11px] font-medium leading-relaxed">
                      By confirming, this transfer will be sent for approval. Stock will be reserved at the source branch immediately.
                   </p>
                </div>
             </div>
           )}
        </div>

        <DialogFooter className="p-8 bg-white/[0.01] border-t border-white/5 gap-3">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[10px] font-bold uppercase tracking-widest h-12 px-6">
              Cancel
           </Button>
           {step > 1 && (
             <Button variant="outline" onClick={() => setStep(step - 1)} className="text-[10px] font-bold uppercase tracking-widest h-12 px-6 border-white/10 bg-white/5">
                Previous
             </Button>
           )}
           {step < 3 ? (
             <Button 
               className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-brass-light"
               onClick={() => setStep(step + 1)}
               disabled={step === 1 && (!fromBranch || !toBranch)}
             >
                Continue <ChevronRight className="size-4 ml-2" />
             </Button>
           ) : (
             <Button 
               className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-brass-light shadow-xl shadow-brass/20"
               onClick={handleCreate}
               disabled={createMutation.isPending}
             >
                Confirm Transfer Request
             </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ArrowLeft(props: any) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
