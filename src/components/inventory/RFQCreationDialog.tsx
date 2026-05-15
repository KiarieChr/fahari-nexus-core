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
  Trash2, 
  Plus, 
  Search,
  ChevronRight,
  ClipboardList,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useProducts, useBranches } from "@/lib/api-hooks";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface RFQCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RFQCreationDialog({ open, onOpenChange }: RFQCreationDialogProps) {
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState("");
  const [deadline, setDeadline] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const { data: productsData } = useProducts();
  const { data: branchesData } = useBranches();
  
  const products = productsData?.results || [];
  const branches = branchesData?.results || [];

  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product: any) => {
    if (items.find(i => i.id === product.id)) return;
    setItems([...items, { ...product, quantity: 100 }]);
    setSearch("");
  };

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleCreate = async () => {
    // API logic would go here
    toast.success("RFQ published successfully!");
    onOpenChange(false);
    reset();
  };

  const reset = () => {
    setStep(1);
    setItems([]);
    setBranch("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-[#030711] border-white/10 text-white p-0 overflow-hidden rounded-3xl shadow-2xl">
        <DialogHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
             <div className="size-12 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center text-brass">
                <ClipboardList className="size-6" />
             </div>
             <div>
                <DialogTitle className="text-2xl font-display text-white">Create RFQ</DialogTitle>
                <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">
                   Request pricing from multiple suppliers
                </DialogDescription>
             </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
           {/* Step indicators */}
           <div className="flex items-center justify-center gap-12">
              {[
                { id: 1, label: "Configuration", icon: Calendar },
                { id: 2, label: "Item Manifest", icon: Package },
                { id: 3, label: "Publish", icon: CheckCircle2 }
              ].map((s) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                   <div className={cn(
                     "size-10 rounded-xl border flex items-center justify-center transition-all duration-300",
                     step === s.id ? "bg-brass border-brass text-navy shadow-lg shadow-brass/20" : 
                     step > s.id ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-500" : "bg-white/5 border-white/10 text-muted-foreground"
                   )}>
                      <s.icon className="size-5" />
                   </div>
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-widest",
                     step === s.id ? "text-white" : "text-muted-foreground"
                   )}>{s.label}</span>
                </div>
              ))}
           </div>

           {step === 1 && (
             <div className="grid grid-cols-2 gap-8 py-4">
                <div className="space-y-4">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Requesting Branch</Label>
                   <select 
                     className="w-full h-14 bg-white/5 border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-brass/50"
                     value={branch}
                     onChange={(e) => setBranch(e.target.value)}
                   >
                      <option value="">Select branch</option>
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                   </select>
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Response Deadline</Label>
                   <Input 
                     type="date" 
                     className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-brass/50"
                     value={deadline}
                     onChange={(e) => setDeadline(e.target.value)}
                   />
                </div>
             </div>
           )}

           {step === 2 && (
             <div className="space-y-6">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search products to add to RFQ..." 
                     className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:border-brass/50 text-sm"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                   />
                   {search && (
                     <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0D14] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        {filteredProducts.map((p: any) => (
                          <div 
                            key={p.id} 
                            className="p-4 hover:bg-white/5 flex items-center justify-between cursor-pointer group border-b border-white/5 last:border-0"
                            onClick={() => addItem(p)}
                          >
                             <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-brass">
                                   <Package className="size-5" />
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-white">{p.name}</p>
                                   <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{p.sku}</p>
                                </div>
                             </div>
                             <Plus className="size-4 text-muted-foreground group-hover:text-brass" />
                          </div>
                        ))}
                     </div>
                   )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.01] overflow-hidden">
                   <Table>
                      <TableHeader className="bg-white/[0.02]">
                         <TableRow className="border-white/5">
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest">Product</TableHead>
                            <TableHead className="text-[10px] uppercase font-bold tracking-widest w-32 text-center">Required Qty</TableHead>
                            <TableHead className="text-right text-[10px] uppercase font-bold tracking-widest">Action</TableHead>
                         </TableRow>
                      </TableHeader>
                      <TableBody>
                         {items.length === 0 ? (
                           <TableRow className="hover:bg-transparent border-white/5">
                              <TableCell colSpan={3} className="h-32 text-center">
                                 <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Search and add items to your request</p>
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
                                   className="h-9 text-center bg-white/5 border-white/10 rounded-lg text-xs"
                                   value={item.quantity}
                                   onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, quantity: Number(e.target.value) } : i))}
                                 />
                              </TableCell>
                              <TableCell className="text-right">
                                 <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="text-rose-500 hover:text-rose-400"
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
             <div className="space-y-6 py-4">
                <div className="p-8 rounded-3xl bg-brass/5 border border-brass/20 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Target Volume</p>
                         <h4 className="text-2xl font-display text-white">{items.length} Products</h4>
                      </div>
                      <div className="text-right space-y-1">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-brass">Deadline</p>
                         <h4 className="text-lg font-bold text-white">{deadline || 'No Deadline'}</h4>
                      </div>
                   </div>
                   
                   <div className="pt-6 border-t border-white/10">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Line Items Preview</p>
                      <div className="grid grid-cols-2 gap-3">
                         {items.map(item => (
                           <div key={item.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-white truncate mr-2">{item.name}</span>
                              <Badge className="bg-brass text-navy font-bold text-[9px]">{item.quantity}</Badge>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-blue-400">
                   <AlertCircle className="size-5 shrink-0" />
                   <p className="text-[10px] font-medium leading-relaxed">
                      Publishing this RFQ will notify your preferred suppliers and allow them to submit digital bids through the supplier portal.
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
               disabled={step === 1 && !branch}
             >
                Continue <ChevronRight className="size-4 ml-2" />
             </Button>
           ) : (
             <Button 
               className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-12 px-8 hover:bg-brass-light shadow-xl shadow-brass/20"
               onClick={handleCreate}
             >
                Publish RFQ Request
             </Button>
           )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CheckCircle2(props: any) {
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
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
