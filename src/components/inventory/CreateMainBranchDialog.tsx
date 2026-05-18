import { useState } from "react";
import { toast } from "sonner";
import {
  GitBranch,
  Building2,
  Hash,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Terminal,
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
import { useCreateMainBranch, type CreateMainBranchPayload } from "@/lib/api-hooks";

// ─────────────────────────────────────────────────────────────────────────────
interface CreateMainBranchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
export function CreateMainBranchDialog({ isOpen, onOpenChange }: CreateMainBranchDialogProps) {
  const [companyId, setCompanyId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const createBranch = useCreateMainBranch();

  const reset = () => {
    setCompanyId("");
    setBranchName("");
    setBranchCode("");
    setEmail("");
    setPhone("");
    setAddress("");
    createBranch.reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  const handleSubmit = () => {
    const id = parseInt(companyId);
    if (!companyId || isNaN(id) || id <= 0) {
      toast.error("Please enter a valid Company ID.");
      return;
    }

    const payload: CreateMainBranchPayload = {
      company_id: id,
      branch_name: branchName.trim() || undefined,
      branch_code: branchCode.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
    };

    createBranch.mutate(payload, {
      onSuccess: (data) => {
        toast.success(`Branch "${data.branch_name}" created for ${data.company}!`);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.error || "Failed to create branch.";
        toast.error(msg);
      },
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#0A0D14] border border-white/10 text-foreground p-0 overflow-hidden">

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <GitBranch className="size-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-white">
                Create Main Branch
              </DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                Super Admin · Management Command
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="px-6 py-5 space-y-5">

            {/* ── Company ID ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5 block">
                <Building2 className="size-3" /> Company ID
                <span className="text-rose-400 ml-1">*</span>
              </label>
              <input
                type="number"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="e.g. 1"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
              <p className="text-[9px] text-muted-foreground mt-1.5">
                Find the company ID from the Django admin panel or company settings.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* ── Branch Name ── */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Auto-generated if blank"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 transition-all"
                />
              </div>

              {/* ── Branch Code ── */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1 block">
                  <Hash className="size-3" /> Branch Code
                </label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                  placeholder="Auto-generated if blank"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-mono outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
            </div>

            <Separator className="bg-white/5" />

            {/* ── Contact Info ── */}
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
              Contact Info (optional)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1 block">
                  <Mail className="size-3" /> Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="branch@company.co.ke"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1 block">
                  <Phone className="size-3" /> Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 700 000 000"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1 block">
                <MapPin className="size-3" /> Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Westlands, Nairobi"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-blue-500/60 transition-all"
              />
            </div>

            {/* ── Terminal output ── */}
            {(createBranch.isSuccess || createBranch.isError) && (
              <>
                <Separator className="bg-white/5" />
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="size-3.5 text-emerald-400" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      Command Output
                    </p>
                  </div>
                  <pre className="w-full min-h-[80px] p-4 rounded-xl bg-[#060810] border border-emerald-500/20 text-emerald-300 text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-auto max-h-48">
                    {createBranch.isSuccess
                      ? (createBranch.data?.log || `✔ Branch "${createBranch.data?.branch_name}" created successfully for ${createBranch.data?.company}.`)
                      : (createBranch.error as any)?.response?.data?.log
                        || (createBranch.error as any)?.response?.data?.error
                        || "An unexpected error occurred."}
                  </pre>
                </div>

                {createBranch.isSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-300">
                        Branch Created
                      </p>
                      <p className="text-xs text-white mt-1">
                        <span className="font-medium">{createBranch.data?.branch_name}</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span className="font-mono text-brass">{createBranch.data?.branch_code}</span>
                      </p>
                    </div>
                  </div>
                )}

                {createBranch.isError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                    <AlertCircle className="size-5 text-rose-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-300">
                      {(createBranch.error as any)?.response?.data?.error || "Failed to create branch."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2 border-t border-white/5 flex gap-3">
          <button
            onClick={() => handleClose(false)}
            className="flex-1 h-11 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-all text-[10px] uppercase tracking-widest font-bold"
          >
            Close
          </button>
          {createBranch.isSuccess ? (
            <button
              onClick={reset}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
            >
              <GitBranch className="size-3.5" /> Create Another
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createBranch.isPending || !companyId}
              className="flex-1 h-11 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-blue-600/20"
            >
              {createBranch.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <GitBranch className="size-3.5" />
              )}
              Run Command
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
