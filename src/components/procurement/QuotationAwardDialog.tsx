import { useState } from "react";
import { useUpdateQuotation, useCreatePurchase } from "@/lib/api-hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Building2, ShoppingBag, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  quotations: any[];
  rfq: any;
}

export function QuotationAwardDialog({ open, onOpenChange, quotations, rfq }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [step, setStep] = useState<"compare" | "confirm" | "done">("compare");

  const updateQuotation = useUpdateQuotation();
  const createPurchase = useCreatePurchase();

  const selected = quotations.find((q) => q.id === selectedId);

  const minTotal = Math.min(...quotations.map((q) => Number(q.total_amount) || Infinity));

  const handleAward = async () => {
    if (!selected) return;
    setStep("confirm");
  };

  const handleConfirmAward = async () => {
    if (!selected) return;
    try {
      // 1. Mark selected quotation as ACCEPTED
      await updateQuotation.mutateAsync({
        id: selected.id,
        data: { status: "ACCEPTED" },
      });

      // 2. Reject all others
      for (const q of quotations) {
        if (q.id !== selected.id) {
          await updateQuotation.mutateAsync({ id: q.id, data: { status: "REJECTED" } });
        }
      }

      // 3. Create a Purchase Order from the winning quotation
      const poItems = selected.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        subtotal: Number(item.quantity) * Number(item.unit_cost),
      }));

      await createPurchase.mutateAsync({
        supplier: selected.supplier,
        branch: rfq?.branch || null,
        notes: `Auto-generated from RFQ #${rfq?.rfq_number} — Awarded to ${selected.supplier_name}`,
        items: poItems,
      });

      setStep("done");
    } catch (err) {
      toast.error("Failed to award bid. Please try again.");
    }
  };

  const isPending = updateQuotation.isPending || createPurchase.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-brass" />
            Evaluate & Award Quotations
          </DialogTitle>
          <DialogDescription>
            Compare bids side-by-side. Award the winning supplier to automatically generate a Purchase Order.
          </DialogDescription>
        </DialogHeader>

        {step === "done" ? (
          <div className="py-12 flex flex-col items-center gap-4 text-center">
            <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-9 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Bid Awarded Successfully</h3>
              <p className="text-muted-foreground text-sm">
                <strong>{selected?.supplier_name}</strong> has been awarded the contract. A Purchase Order has been automatically created.
              </p>
            </div>
            <Button onClick={() => { onOpenChange(false); setStep("compare"); setSelectedId(null); }}>
              Close
            </Button>
          </div>
        ) : step === "confirm" ? (
          <div className="space-y-6 py-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400 mb-1">Confirm Award</p>
                <p className="text-sm text-muted-foreground">
                  You are awarding this contract to <strong className="text-foreground">{selected?.supplier_name}</strong> for a total of{" "}
                  <strong className="text-foreground">{Number(selected?.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>.
                  All other bids will be declined and a Purchase Order will be created automatically.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("compare")}>Back</Button>
              <Button
                onClick={handleConfirmAward}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirm & Generate PO
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {quotations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bids received for this RFQ yet.</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quotations.map((q) => {
                    const total = Number(q.total_amount) || 0;
                    const isLowest = total === minTotal && total > 0;
                    const isSelected = q.id === selectedId;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setSelectedId(isSelected ? null : q.id)}
                        className={cn(
                          "relative text-left rounded-xl border p-4 transition-all hover:border-brass/50 space-y-3",
                          isSelected
                            ? "border-brass bg-brass/5 ring-1 ring-brass"
                            : "border-border bg-card"
                        )}
                      >
                        {isLowest && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest">
                              Lowest Bid
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="size-8 rounded-md bg-muted grid place-items-center shrink-0">
                            <Building2 className="size-4 text-brass" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground leading-none">{q.supplier_name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Quote #{q.quotation_number}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                          {q.items?.slice(0, 3).map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-muted-foreground truncate max-w-[60%]">{item.product_name}</span>
                              <span className="font-mono font-bold text-foreground">{Number(item.unit_cost).toFixed(2)}/unit</span>
                            </div>
                          ))}
                          {(q.items?.length || 0) > 3 && (
                            <p className="text-[10px] text-muted-foreground text-right">+{q.items.length - 3} more</p>
                          )}
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Total</span>
                          <span className={cn("text-base font-bold font-mono", isLowest ? "text-emerald-500" : "text-foreground")}>
                            {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                  <Button
                    onClick={handleAward}
                    disabled={!selectedId}
                    className="bg-brass text-navy hover:bg-brass-light"
                  >
                    <ShoppingBag className="mr-2 size-4" />
                    Award to {selected?.supplier_name || "Selected Supplier"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
