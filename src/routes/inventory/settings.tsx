import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Settings2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Zap,
  Package,
  History,
  TrendingUp,
  FileSearch,
  ShieldCheck,
  Boxes,
  Store,
  Wine,
  Utensils
} from "lucide-react";
import { toast } from "sonner";
import { 
  useInventorySettings, 
  useUpdateInventorySettings,
  useCompany,
  useUpdateCompany
} from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/inventory/settings")({
  head: () => ({
    meta: [
      { title: "Inventory Settings — Fahari Nexus" },
      { name: "description", content: "Configure stock control, thresholds and automation." },
    ],
  }),
  component: InventorySettingsPage,
});

function InventorySettingsPage() {
  const { data: settings, isLoading } = useInventorySettings();
  const updateSettings = useUpdateInventorySettings();
  const { data: company } = useCompany();
  const updateCompany = useUpdateCompany();
  
  const [form, setForm] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(form);
      toast.success("Inventory settings updated successfully!");
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to update settings";
      toast.error(msg);
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="size-10 animate-spin text-brass" />
        <p className="font-serif italic">Loading inventory configuration...</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1200px] mx-auto min-h-screen">
      <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display">
            Configuration · Control
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight flex items-center gap-3">
            <Boxes className="size-8 text-brass" />
            Inventory Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-sm italic font-serif">
            Tailor stock management automation and operational thresholds
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {isSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="size-5" />
            <p className="text-sm font-medium">Inventory settings updated successfully!</p>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <XCircle className="size-5" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Automation & Behavior */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                <RefreshCw className="size-4" />
                Automation & Logic
              </CardTitle>
              <CardDescription className="text-xs">Configure how the system handles stock movements automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-Update on Sale</Label>
                  <p className="text-[10px] text-muted-foreground italic">Deduct stock immediately when a POS sale is finalized</p>
                </div>
                <Switch 
                  checked={form.auto_update_stock_on_sale} 
                  onCheckedChange={(v) => setForm({...form, auto_update_stock_on_sale: v})} 
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-Update on Purchase</Label>
                  <p className="text-[10px] text-muted-foreground italic">Increase stock automatically when purchase orders are marked received</p>
                </div>
                <Switch 
                  checked={form.auto_update_stock_on_purchase} 
                  onCheckedChange={(v) => setForm({...form, auto_update_stock_on_purchase: v})} 
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-emerald-400">Simplified Stock-In</Label>
                  <p className="text-[10px] text-muted-foreground italic">Allow quick stock entry bypassing the full GRN/Inspection workflow</p>
                </div>
                <Switch 
                  checked={form.enable_simple_stockin} 
                  onCheckedChange={(v) => setForm({...form, enable_simple_stockin: v})} 
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium text-rose-400">Allow Negative Inventory</Label>
                  <p className="text-[10px] text-muted-foreground italic">Permit sales even if the system records 0 stock (Not Recommended)</p>
                </div>
                <Switch 
                  checked={form.allow_negative_inventory} 
                  onCheckedChange={(v) => setForm({...form, allow_negative_inventory: v})} 
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Section Configuration */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                <Store className="size-4" />
                POS Section Access
              </CardTitle>
              <CardDescription className="text-xs">Enable or disable specialized POS terminals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Utensils className="size-3 text-orange-400" />
                    Restaurant Mode
                  </Label>
                  <p className="text-[10px] text-muted-foreground italic">Enable kitchen tickets, table management, and dining sessions</p>
                </div>
                <Switch 
                  checked={company?.enable_restaurant_mode} 
                  onCheckedChange={async (v) => {
                    await updateCompany.mutateAsync({ ...company, enable_restaurant_mode: v });
                  }} 
                />
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Wine className="size-3 text-purple-400" />
                    Bar & Drinks Mode
                  </Label>
                  <p className="text-[10px] text-muted-foreground italic">Enable beverage-specific menus and counter service terminal</p>
                </div>
                <Switch 
                  checked={company?.enable_bar_mode} 
                  onCheckedChange={async (v) => {
                    await updateCompany.mutateAsync({ ...company, enable_bar_mode: v });
                  }} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Thresholds & Alerts */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                <AlertTriangle className="size-4" />
                Alerts & Thresholds
              </CardTitle>
              <CardDescription className="text-xs">Define limits for low stock and expiry notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Default Reorder Point</Label>
                  <Input 
                    type="number" 
                    value={form.default_reorder_point} 
                    onChange={(e) => setForm({...form, default_reorder_point: Number(e.target.value)})}
                    className="bg-white/5 border-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Default Reorder Qty</Label>
                  <Input 
                    type="number" 
                    value={form.default_reorder_quantity} 
                    onChange={(e) => setForm({...form, default_reorder_quantity: Number(e.target.value)})}
                    className="bg-white/5 border-white/10" 
                  />
                </div>
              </div>
              <Separator className="bg-white/5" />
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Expiry Alert Threshold (Days)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={form.expiry_alert_days} 
                    onChange={(e) => setForm({...form, expiry_alert_days: Number(e.target.value)})}
                    className="bg-white/5 border-white/10 w-24" 
                  />
                  <p className="text-[10px] text-muted-foreground italic leading-tight">Notify when items are within this many days of expiring</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Critical Expiry Warning (Days)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={form.critical_expiry_days} 
                    onChange={(e) => setForm({...form, critical_expiry_days: Number(e.target.value)})}
                    className="bg-rose-500/10 border-rose-500/20 w-24 text-rose-500" 
                  />
                  <p className="text-[10px] text-muted-foreground italic leading-tight">High-priority alerts for imminent expiration</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Batch & Serial Controls */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                <Zap className="size-4" />
                Batch & Tracking
              </CardTitle>
              <CardDescription className="text-xs">Advanced lot tracking and serialization configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto-Generate Batches</Label>
                  <p className="text-[10px] text-muted-foreground italic">Automatically create batch IDs for incoming stock</p>
                </div>
                <Switch 
                  checked={form.auto_generate_batch_numbers} 
                  onCheckedChange={(v) => setForm({...form, auto_generate_batch_numbers: v})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Batch Format</Label>
                <Input 
                  value={form.batch_number_format} 
                  onChange={(e) => setForm({...form, batch_number_format: e.target.value})}
                  className="bg-white/5 border-white/10 font-mono" 
                />
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Available tokens: {"{product}, {date}, {seq}, {random}"}</p>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Strict Expiry Tracking</Label>
                  <p className="text-[10px] text-muted-foreground italic">Require batch IDs for all products with expiry monitoring enabled</p>
                </div>
                <Switch 
                  checked={form.require_batch_for_expiry_items} 
                  onCheckedChange={(v) => setForm({...form, require_batch_for_expiry_items: v})} 
                />
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Audit */}
          <Card className="bg-white/[0.02] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-brass flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Audit & Compliance
              </CardTitle>
              <CardDescription className="text-xs">Security and financial controls for inventory integrity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Inventory Costing Method</Label>
                <Select 
                  value={form.costing_method} 
                  onValueChange={(v) => setForm({...form, costing_method: v})}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-navy border-white/10 text-white">
                    <SelectItem value="AVERAGE">Weighted Average Cost (WAC)</SelectItem>
                    <SelectItem value="FIFO">First In, First Out (FIFO)</SelectItem>
                    <SelectItem value="LIFO">Last In, First Out (LIFO)</SelectItem>
                    <SelectItem value="STANDARD">Standard Costing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="bg-white/5" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Stock Take Approval</Label>
                  <p className="text-[10px] text-muted-foreground italic">Require manager approval for all physical count adjustments</p>
                </div>
                <Switch 
                  checked={form.require_stock_take_approval} 
                  onCheckedChange={(v) => setForm({...form, require_stock_take_approval: v})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Variance Warning Threshold (%)</Label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    value={form.stock_take_variance_threshold} 
                    onChange={(e) => setForm({...form, stock_take_variance_threshold: Number(e.target.value)})}
                    className="bg-white/5 border-white/10 w-24" 
                  />
                  <p className="text-[10px] text-muted-foreground italic leading-tight">Flag adjustments that exceed this percentage of total stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-6">
          <Button 
            type="submit" 
            disabled={updateSettings.isPending}
            className="h-12 px-10 rounded-xl bg-brass text-navy font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-brass-light transition-all shadow-xl shadow-brass/20 active:scale-95"
          >
            {updateSettings.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Save className="size-5" />
            )}
            Deploy Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
