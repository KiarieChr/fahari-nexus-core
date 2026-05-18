import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Minus,
  Hash,
  Calendar,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  PackagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useAdjustStock,
  useProductBatches,
  type AdjustStockPayload,
  type ProductBatch,
} from "@/lib/api-hooks";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface StockJournalDialogProps {
  productId: number | null;
  productName?: string;
  productSku?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type AdjType = "add" | "remove" | "set";

const REASONS = [
  { code: "recount", label: "Physical Recount" },
  { code: "damage", label: "Damaged Goods" },
  { code: "theft", label: "Theft / Loss" },
  { code: "expired", label: "Expired" },
  { code: "other", label: "Other" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function StockJournalDialog({
  productId,
  productName,
  productSku,
  isOpen,
  onOpenChange,
}: StockJournalDialogProps) {
  // ── Existing batches ──────────────────────────────────────────────────────
  const { data: rawBatches, isLoading: loadingBatches } = useProductBatches(productId);
  const batches: ProductBatch[] = useMemo(() => {
    if (!rawBatches) return [];
    if (Array.isArray(rawBatches)) return rawBatches;
    return (rawBatches as any).results || [];
  }, [rawBatches]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [adjType, setAdjType] = useState<AdjType>("add");
  const [quantity, setQuantity] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<string>(""); // existing batch_number
  const [isNewBatch, setIsNewBatch] = useState(false);
  const [newBatchNumber, setNewBatchNumber] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [reason, setReason] = useState("recount");
  const [notes, setNotes] = useState("");
  const [batchDropdownOpen, setBatchDropdownOpen] = useState(false);

  const adjustStock = useAdjustStock();

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedBatchInfo = batches.find((b) => b.batch_number === selectedBatch);

  const reset = () => {
    setAdjType("add");
    setQuantity("");
    setSelectedBatch("");
    setIsNewBatch(false);
    setNewBatchNumber("");
    setMfgDate("");
    setExpDate("");
    setReason("recount");
    setNotes("");
    adjustStock.reset();
  };

  const handleClose = (open: boolean) => {
    if (!open) reset();
    onOpenChange(open);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!productId) return;
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      toast.error("Please enter a valid positive quantity.");
      return;
    }
    if (isNewBatch && !newBatchNumber.trim()) {
      toast.error("Please enter a batch number for the new batch.");
      return;
    }

    const payload: AdjustStockPayload = {
      adjustment_type: adjType,
      quantity: qty,
      batch_number: isNewBatch ? newBatchNumber.trim() : selectedBatch || undefined,
      manufacturing_date: isNewBatch && mfgDate ? mfgDate : undefined,
      expiry_date: isNewBatch && expDate ? expDate : undefined,
      reason,
      notes,
    };

    adjustStock.mutate(
      { productId, payload },
      {
        onSuccess: (data) => {
          toast.success(
            `Stock updated: ${data.before_quantity} → ${data.after_quantity} units`,
          );
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.error || "Failed to adjust stock.");
        },
      },
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl bg-[#0A0D14] border border-white/10 text-foreground p-0 overflow-hidden">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-10 rounded-xl bg-brass/10 border border-brass/20 flex items-center justify-center">
              <BookOpen className="size-5 text-brass" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-white">
                Inventory Journal
              </DialogTitle>
              <DialogDescription className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                {productName ?? "Product"} · {productSku ?? ""}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh]">
          <div className="px-6 py-5 space-y-6">

            {/* ── Adjustment type ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Adjustment Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: "add", label: "Add Stock", icon: Plus, color: "emerald" },
                    { key: "remove", label: "Remove", icon: Minus, color: "rose" },
                    { key: "set", label: "Set To", icon: Hash, color: "amber" },
                  ] as { key: AdjType; label: string; icon: any; color: string }[]
                ).map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => setAdjType(key)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-[10px] uppercase tracking-widest font-bold",
                      adjType === key
                        ? color === "emerald"
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                          : color === "rose"
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-400"
                            : "bg-amber-500/10 border-amber-500/40 text-amber-400"
                        : "bg-white/[0.02] border-white/10 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Quantity ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Quantity
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-2xl font-display tabular-nums outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
              />
            </div>

            <Separator className="bg-white/5" />

            {/* ── Batch picker ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Batch (optional)
              </label>

              {loadingBatches ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-4 justify-center">
                  <Loader2 className="size-4 animate-spin text-brass" />
                  Loading batches…
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Existing batch dropdown */}
                  {batches.length > 0 && !isNewBatch && (
                    <div className="relative">
                      <button
                        onClick={() => setBatchDropdownOpen((o) => !o)}
                        className="w-full h-11 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-white text-left flex items-center justify-between hover:border-white/20 transition-all"
                      >
                        <span className="text-sm">
                          {selectedBatch ? (
                            <>
                              <span className="font-medium">{selectedBatch}</span>
                              {selectedBatchInfo && (
                                <span className="text-muted-foreground text-xs ml-2">
                                  (available: {selectedBatchInfo.available_quantity})
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              — No batch selected (adjust unbatched stock) —
                            </span>
                          )}
                        </span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </button>

                      {batchDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-[#0D1018] shadow-2xl overflow-hidden">
                          {/* No batch option */}
                          <button
                            onClick={() => { setSelectedBatch(""); setBatchDropdownOpen(false); }}
                            className="w-full px-4 py-3 text-left text-xs text-muted-foreground hover:bg-white/[0.04] transition-colors border-b border-white/5"
                          >
                            No batch (unbatched stock)
                          </button>
                          {batches.map((b) => (
                            <button
                              key={b.id}
                              onClick={() => { setSelectedBatch(b.batch_number); setBatchDropdownOpen(false); }}
                              className="w-full px-4 py-3 text-left hover:bg-white/[0.04] transition-colors flex items-center justify-between"
                            >
                              <div>
                                <p className="text-xs font-medium text-white">{b.batch_number}</p>
                                {b.expiry_date && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Exp: {new Date(b.expiry_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs tabular-nums text-emerald-400 font-display">
                                {b.available_quantity} units
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle to new batch */}
                  <button
                    onClick={() => { setIsNewBatch((n) => !n); setSelectedBatch(""); }}
                    className={cn(
                      "flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-lg border transition-all",
                      isNewBatch
                        ? "bg-brass/10 border-brass/30 text-brass"
                        : "bg-white/[0.02] border-white/10 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    <PackagePlus className="size-3.5" />
                    {isNewBatch ? "Creating new batch" : "Create new batch"}
                  </button>

                  {/* New batch fields */}
                  {isNewBatch && (
                    <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/10">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 block">
                          Batch Number
                        </label>
                        <input
                          type="text"
                          value={newBatchNumber}
                          onChange={(e) => setNewBatchNumber(e.target.value)}
                          placeholder="e.g. BATCH-2026-001"
                          className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-brass/60 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 flex items-center gap-1 block">
                            <Calendar className="size-3" /> Mfg Date
                          </label>
                          <input
                            type="date"
                            value={mfgDate}
                            onChange={(e) => setMfgDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-brass/60 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5 flex items-center gap-1 block">
                            <Calendar className="size-3" /> Expiry Date
                          </label>
                          <input
                            type="date"
                            value={expDate}
                            onChange={(e) => setExpDate(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-brass/60 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator className="bg-white/5" />

            {/* ── Reason ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 block">
                Reason
              </label>
              <div className="flex flex-wrap gap-2">
                {REASONS.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => setReason(code)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest font-bold border transition-all",
                      reason === code
                        ? "bg-brass/10 border-brass/40 text-brass"
                        : "bg-white/[0.02] border-white/10 text-muted-foreground hover:border-white/20",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2 flex items-center gap-1.5 block">
                <FileText className="size-3" /> Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional context for this adjustment…"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all resize-none"
              />
            </div>

            {/* ── Result card (shown after success) ── */}
            {adjustStock.isSuccess && adjustStock.data && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 shrink-0" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-emerald-300 uppercase tracking-widest text-[10px]">
                      Adjustment Applied
                    </p>
                    <p className="text-white">
                      {adjustStock.data.before_quantity} → {adjustStock.data.after_quantity} units
                      {adjustStock.data.batch_number && (
                        <span className="text-muted-foreground ml-2">
                          (Batch: {adjustStock.data.batch_number})
                        </span>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      Total product stock: <span className="text-white font-medium">{adjustStock.data.new_total_stock}</span> units
                    </p>
                  </div>
                </div>
              </div>
            )}

            {adjustStock.isError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                <AlertCircle className="size-5 text-rose-400 mt-0.5 shrink-0" />
                <p className="text-xs text-rose-300">
                  {(adjustStock.error as any)?.response?.data?.error || "An error occurred. Please try again."}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2 border-t border-white/5 flex gap-3">
          <button
            onClick={() => handleClose(false)}
            className="flex-1 h-11 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-all text-[10px] uppercase tracking-widest font-bold"
          >
            Cancel
          </button>
          {adjustStock.isSuccess ? (
            <button
              onClick={reset}
              className="flex-1 h-11 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="size-3.5" /> New Adjustment
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={adjustStock.isPending || !quantity}
              className="flex-1 h-11 rounded-xl bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brass/10"
            >
              {adjustStock.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BookOpen className="size-3.5" />
              )}
              Post Entry
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
