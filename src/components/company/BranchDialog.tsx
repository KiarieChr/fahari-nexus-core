import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useCreateBranch, useUpdateBranch } from "@/lib/api-hooks";
import { Loader2 } from "lucide-react";

interface Branch {
  id: number;
  name: string;
  branch_code: string;
  description?: string;
  email?: string;
  phone_number?: string;
  land_phone?: string;
  address?: string;
  city?: string;
  operation_mode?: string;
  has_separate_accounting?: boolean;
  can_process_refunds_independently?: boolean;
  can_adjust_prices_independently?: boolean;
  shared_inventory_with_main?: boolean;
  is_main_branch?: boolean;
  is_active: boolean;
  is_open?: boolean;
}

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
}

export function BranchDialog({ open, onOpenChange, branch }: BranchDialogProps) {
  const isEdit = !!branch;

  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const [name, setName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [landPhone, setLandPhone] = useState("");
  const [address, setAddress] = useState("");
  const [operationMode, setOperationMode] = useState("JOINT");
  const [sharedInventory, setSharedInventory] = useState(true);
  const [separateAccounting, setSeparateAccounting] = useState(false);
  const [independentRefunds, setIndependentRefunds] = useState(false);
  const [independentPrices, setIndependentPrices] = useState(false);
  const [isMainBranch, setIsMainBranch] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (branch) {
      setName(branch.name || "");
      setBranchCode(branch.branch_code || "");
      setDescription(branch.description || "");
      setEmail(branch.email || "");
      setPhoneNumber(branch.phone_number || "");
      setLandPhone(branch.land_phone || "");
      setAddress(branch.address || "");
      setOperationMode(branch.operation_mode || "JOINT");
      setSharedInventory(branch.shared_inventory_with_main !== false);
      setSeparateAccounting(!!branch.has_separate_accounting);
      setIndependentRefunds(!!branch.can_process_refunds_independently);
      setIndependentPrices(!!branch.can_adjust_prices_independently);
      setIsMainBranch(!!branch.is_main_branch);
      setIsActive(branch.is_active !== false);
      setIsOpen(branch.is_open !== false);
    } else {
      setName("");
      setBranchCode("");
      setDescription("");
      setEmail("");
      setPhoneNumber("");
      setLandPhone("");
      setAddress("");
      setOperationMode("JOINT");
      setSharedInventory(true);
      setSeparateAccounting(false);
      setIndependentRefunds(false);
      setIndependentPrices(false);
      setIsMainBranch(false);
      setIsActive(true);
      setIsOpen(true);
    }
  }, [branch, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Branch name is required.");
      return;
    }
    if (!branchCode.trim()) {
      toast.error("Branch code is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      branch_code: branchCode.trim(),
      description: description.trim(),
      email: email.trim() || undefined,
      phone_number: phoneNumber.trim() || undefined,
      land_phone: landPhone.trim() || undefined,
      address: address.trim() || undefined,
      operation_mode: operationMode,
      shared_inventory_with_main: sharedInventory,
      has_separate_accounting: separateAccounting,
      can_process_refunds_independently: independentRefunds,
      can_adjust_prices_independently: independentPrices,
      is_main_branch: isMainBranch,
      is_active: isActive,
      is_open: isOpen,
    };

    try {
      if (isEdit && branch) {
        await updateBranch.mutateAsync({ id: branch.id, data: payload });
        toast.success("Branch details updated successfully!");
      } else {
        await createBranch.mutateAsync(payload);
        toast.success("Branch created successfully!");
      }
      onOpenChange(false);
    } catch (error: any) {
      const serverError = error.response?.data;
      if (serverError && typeof serverError === "object") {
        const errorMsg = Object.entries(serverError)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
          .join(" | ");
        toast.error(errorMsg || "Failed to save branch.");
      } else {
        toast.error(error.message || "Failed to save branch. Make sure branch code is unique.");
      }
    }
  };

  const isPending = createBranch.isPending || updateBranch.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800 text-white rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-slate-800">
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider font-cinzel text-brass">
            {isEdit ? `Manage: ${branch?.name}` : "Create New Branch Store"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Configure locations, operations, and inventory permissions for your business branch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Primary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 font-medium">Branch Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Nairobi CBD Branch"
                    required
                    className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch_code" className="text-slate-300 font-medium">Branch Code * (Unique)</Label>
                  <Input
                    id="branch_code"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. STORE-001"
                    required
                    className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-300 font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this store branch / warehouse / location..."
                  rows={2}
                  className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg resize-none"
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 font-medium">Branch Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cbd@easybiz.com"
                    className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number" className="text-slate-300 font-medium">Mobile Phone</Label>
                  <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+254700000000"
                    className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="land_phone" className="text-slate-300 font-medium">Land Phone</Label>
                  <Input
                    id="land_phone"
                    value={landPhone}
                    onChange={(e) => setLandPhone(e.target.value)}
                    placeholder="020-1234567"
                    className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-300 font-medium">Physical Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 2nd Floor, Kimathi House, Kimathi Street"
                  className="bg-slate-950 border-slate-800 focus:border-brass/50 text-white placeholder-slate-500 rounded-lg"
                />
              </div>

              {/* Operation Settings */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <h3 className="text-brass uppercase tracking-wider font-semibold text-xs">Operation settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="operation_mode" className="text-slate-300 font-medium">Operation Mode</Label>
                    <Select value={operationMode} onValueChange={setOperationMode}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-lg">
                        <SelectValue placeholder="Select Operation Mode" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="JOINT">Joint Operation with Main Store</SelectItem>
                        <SelectItem value="INDEPENDENT">Independent Operation</SelectItem>
                        <SelectItem value="SYNCHRONIZED">Synchronized Inventory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="border-t border-slate-800 pt-6 space-y-6">
                <h3 className="text-brass uppercase tracking-wider font-semibold text-xs">Financial & Inventory Independence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-slate-200">Shared Inventory with Main</Label>
                      <p className="text-xs text-slate-400">Share inventory databases directly with the main store.</p>
                    </div>
                    <Switch checked={sharedInventory} onCheckedChange={setSharedInventory} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-slate-200">Has Separate Accounting</Label>
                      <p className="text-xs text-slate-400">Record distinct cash operations and accounting journals.</p>
                    </div>
                    <Switch checked={separateAccounting} onCheckedChange={setSeparateAccounting} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-slate-200">Process Refunds Independently</Label>
                      <p className="text-xs text-slate-400">Allow branch users to refund cash without main branch clearance.</p>
                    </div>
                    <Switch checked={independentRefunds} onCheckedChange={setIndependentRefunds} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-slate-200">Adjust Prices Independently</Label>
                      <p className="text-xs text-slate-400">Allow local managers to override prices for sales promotions.</p>
                    </div>
                    <Switch checked={independentPrices} onCheckedChange={setIndependentPrices} />
                  </div>
                </div>
              </div>

              {/* Status and roles */}
              <div className="border-t border-slate-800 pt-6 space-y-6">
                <h3 className="text-brass uppercase tracking-wider font-semibold text-xs">Status & Branch Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold uppercase text-slate-300">Main Branch</Label>
                      <p className="text-[10px] text-slate-500">Global fallbacks</p>
                    </div>
                    <Switch checked={isMainBranch} onCheckedChange={setIsMainBranch} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold uppercase text-slate-300">Active Status</Label>
                      <p className="text-[10px] text-slate-500">Accept transactions</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-slate-800">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold uppercase text-slate-300">IsOpen Status</Label>
                      <p className="text-[10px] text-slate-500">Currently operating</p>
                    </div>
                    <Switch checked={isOpen} onCheckedChange={setIsOpen} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-slate-950 border-t border-slate-850 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg h-11 px-6 transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-brass text-navy font-bold uppercase tracking-widest text-xs h-11 px-8 hover:bg-brass-light transition-all shadow-lg shadow-brass/20 rounded-lg flex items-center justify-center"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                isEdit ? "Update Branch" : "Create Branch"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
