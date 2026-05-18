import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Calendar,
  History,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useMovements, useCreateMovement, useProducts, useBranches } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/inventory/adjustments")({
  head: () => ({
    meta: [
      { title: "Stock Adjustments — Fahari Nexus" },
      { name: "description", content: "Audit-friendly stock movements and adjustments." },
    ],
  }),
  component: AdjustmentsPage,
});

function AdjustmentsPage() {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState<string>("all");
  
  // Form State
  const [formProduct, setFormProduct] = useState("");
  const [formType, setFormType] = useState("ADJUSTMENT");
  const [formQty, setFormQty] = useState("");
  const [formBranch, setFormBranch] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data: movementsData, isLoading: loadingMovements } = useMovements();
  const { data: productsData } = useProducts();
  const { data: branchesData } = useBranches();
  const createMovement = useCreateMovement();

  const movements = useMemo(() => {
    if (!movementsData) return [];
    if (Array.isArray(movementsData)) return movementsData;
    return movementsData.results || [];
  }, [movementsData]);

  const products = useMemo(() => {
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData;
    return productsData.results || [];
  }, [productsData]);

  const branches = useMemo(() => {
    if (!branchesData) return [];
    if (Array.isArray(branchesData)) return branchesData;
    return branchesData.results || [];
  }, [branchesData]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m: any) => {
      const matchSearch = 
        m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
        m.movement_number?.toLowerCase().includes(search.toLowerCase());
      const matchType = movementType === "all" || m.movement_type === movementType;
      return matchSearch && matchType;
    });
  }, [movements, search, movementType]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMovements = movements.filter((m: any) => m.created_at?.startsWith(today));
    
    return {
      todayCount: todayMovements.length,
      inbound: movements.filter((m: any) => ['PURCHASE', 'TRANSFER_IN', 'RETURN'].includes(m.movement_type)).length,
      outbound: movements.filter((m: any) => ['SALE', 'TRANSFER_OUT', 'DAMAGE', 'LOSS'].includes(m.movement_type)).length,
      adjustments: movements.filter((m: any) => m.movement_type === 'ADJUSTMENT').length,
    };
  }, [movements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct || !formQty || !formType) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      await createMovement.mutateAsync({
        product: Number(formProduct),
        movement_type: formType,
        quantity: Number(formQty),
        branch: formBranch ? Number(formBranch) : undefined,
        notes: formNotes,
        reference_number: `ADJ-${Date.now().toString().slice(-6)}`
      });
      toast.success("Stock adjustment recorded successfully");
      setFormProduct("");
      setFormQty("");
      setFormNotes("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to record adjustment");
    }
  };

  const getTypeStyle = (type: string) => {
    if (['PURCHASE', 'TRANSFER_IN', 'RETURN'].includes(type)) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (['SALE', 'TRANSFER_OUT', 'DAMAGE', 'LOSS', 'EXPIRED'].includes(type)) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  };

  const getTypeIcon = (type: string) => {
    if (['PURCHASE', 'TRANSFER_IN', 'RETURN'].includes(type)) return <ArrowDownRight className="size-4" />;
    if (['SALE', 'TRANSFER_OUT', 'DAMAGE', 'LOSS', 'EXPIRED'].includes(type)) return <ArrowUpRight className="size-4" />;
    return <RefreshCw className="size-4" />;
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto min-h-screen">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display">
            Inventory · Movement
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Stock Adjustments & Logs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Track and audit every inventory movement across all branches
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
              <Calendar className="size-5" />
            </div>
            <div>
              <div className="text-xl font-display text-foreground">{stats.todayCount}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Today's Movements</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <ArrowDownRight className="size-5" />
            </div>
            <div>
              <div className="text-xl font-display text-foreground">{stats.inbound}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Inbound</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
              <ArrowUpRight className="size-5" />
            </div>
            <div>
              <div className="text-xl font-display text-foreground">{stats.outbound}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Outbound</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <RefreshCw className="size-5" />
            </div>
            <div>
              <div className="text-xl font-display text-foreground">{stats.adjustments}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Manual Adjustments</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        {/* Main Log Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search by product or ref..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-card border-border focus:border-brass/50 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={movementType} onValueChange={setMovementType}>
                <SelectTrigger className="w-[180px] h-11 bg-card border-border">
                  <SelectValue placeholder="Filter Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0D14] border-border text-foreground">
                  <SelectItem value="all">All Movements</SelectItem>
                  <SelectItem value="PURCHASE">Purchases (IN)</SelectItem>
                  <SelectItem value="SALE">Sales (OUT)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
                  <SelectItem value="DAMAGE">Damages (OUT)</SelectItem>
                  <SelectItem value="LOSS">Loss (OUT)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="h-11 w-11 p-0 rounded-lg bg-card border-border">
                <Filter className="size-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest font-bold">Reference</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-bold">Product</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-bold">Movement Type</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-bold">Quantity</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest font-bold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMovements ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="size-6 animate-spin mx-auto text-brass" /></TableCell></TableRow>
                ) : filteredMovements.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No movements found.</TableCell></TableRow>
                ) : (
                  filteredMovements.map((m: any) => (
                    <TableRow key={m.id} className="border-border hover:bg-muted/10 transition-colors">
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{m.movement_number}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-lg bg-muted/30 flex items-center justify-center">
                            <Package className="size-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{m.product_name}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">{m.branch_name || 'Main Warehouse'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[9px] font-bold border gap-1", getTypeStyle(m.movement_type))}>
                          {getTypeIcon(m.movement_type)}
                          {m.movement_type_display}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-display font-bold">
                          {['SALE', 'TRANSFER_OUT', 'DAMAGE', 'LOSS'].includes(m.movement_type) ? '-' : '+'}{m.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {new Date(m.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Adjustment Form Panel */}
        <div>
          <Card className="bg-card border-border shadow-xl sticky top-8">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="text-sm font-display uppercase tracking-widest text-brass flex items-center gap-2">
                <Plus className="size-4" />
                New Adjustment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</label>
                  <Select value={formProduct} onValueChange={setFormProduct}>
                    <SelectTrigger className="w-full bg-muted/10 border-border h-10">
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0D14] border-border text-foreground">
                      {products.map((p: any) => (
                        <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger className="w-full bg-muted/10 border-border h-10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0D14] border-border text-foreground">
                        <SelectItem value="ADJUSTMENT">Correction</SelectItem>
                        <SelectItem value="DAMAGE">Damage</SelectItem>
                        <SelectItem value="LOSS">Loss</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                        <SelectItem value="RETURN">Return (IN)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quantity</label>
                    <Input 
                      type="number" 
                      value={formQty}
                      onChange={(e) => setFormQty(e.target.value)}
                      className="bg-muted/10 border-border h-10" 
                      placeholder="e.g. 5"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Branch (Optional)</label>
                  <Select value={formBranch} onValueChange={setFormBranch}>
                    <SelectTrigger className="w-full bg-muted/10 border-border h-10">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0D14] border-border text-foreground">
                      {branches.map((b: any) => (
                        <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reason / Notes</label>
                  <Textarea 
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="bg-muted/10 border-border resize-none h-20" 
                    placeholder="Provide justification for audit..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createMovement.isPending}
                  className="w-full h-11 bg-brass text-navy hover:bg-brass-light font-bold uppercase tracking-widest text-xs"
                >
                  {createMovement.isPending ? <Loader2 className="size-4 animate-spin" /> : "Record Adjustment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
