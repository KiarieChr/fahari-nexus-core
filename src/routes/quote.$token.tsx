import { createFileRoute } from "@tanstack/react-router";
import { usePublicQuote, useSubmitPublicQuote } from "@/lib/api-hooks";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Building2, Calendar, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quote/$token")({
  component: PublicQuotePortal,
});

function PublicQuotePortal() {
  const { token } = Route.useParams();
  const { data: quote, isLoading, isError } = usePublicQuote(token);
  const submitQuote = useSubmitPublicQuote();
  
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (quote && quote.items) {
      setItems(
        quote.items.map((item: any) => ({
          ...item,
          unit_cost: item.unit_cost || 0,
        }))
      );
      setNotes(quote.notes || "");
      if (quote.status !== "PENDING") {
        setSubmitted(true);
      }
    }
  }, [quote]);

  const handleUnitCostChange = (id: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unit_cost: numValue } : item))
    );
  };

  const handleSubmit = async () => {
    try {
      await submitQuote.mutateAsync({ token, items, notes });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit quote", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brass mb-4" />
        <p className="text-foreground/70">Loading quotation details...</p>
      </div>
    );
  }

  if (isError || !quote) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="size-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
          <FileText className="size-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Invalid or Expired Link</h1>
        <p className="text-foreground/60 max-w-md">
          The quotation link you followed is no longer active. Please contact the company for a new link.
        </p>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unit_cost, 0);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="bg-sidebar border-b border-border sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-gradient-to-br from-brass-light to-brass-dark grid place-items-center shadow-lg shadow-black/30 ring-1 ring-brass/40">
            <Sparkles className="size-5 text-navy-deep" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-brass-light text-lg tracking-[0.15em] uppercase">
              Fahari Nexus
            </div>
            <div className="text-xs text-sidebar-foreground/50 tracking-[0.2em] uppercase">
              Secure Vendor Portal
            </div>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium">Quote Request #{quote.quotation_number}</div>
          <div className="text-xs text-muted-foreground">{quote.quotation_date}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {submitted ? (
          <div className="bg-card border border-border rounded-xl p-8 sm:p-12 text-center shadow-sm">
            <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-4">Quote Submitted</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">
              Thank you, <strong className="text-foreground">{quote.supplier_name}</strong>. Your quotation has been successfully submitted and is now under review.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div>
                <h1 className="text-3xl font-display text-foreground tracking-wide mb-2">
                  Submit Quotation
                </h1>
                <p className="text-muted-foreground">
                  Please provide your best unit costs for the requested items below.
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex gap-4 min-w-[250px]">
                <div className="rounded-full bg-brass/10 p-3 shrink-0">
                  <Building2 className="size-5 text-brass" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Prepared For
                  </div>
                  <div className="font-medium text-foreground">{quote.supplier_name}</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Item Description</th>
                      <th className="px-6 py-4 text-right">Qty Requested</th>
                      <th className="px-6 py-4 text-right">Unit Cost</th>
                      <th className="px-6 py-4 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {item.product_name}
                        </td>
                        <td className="px-6 py-4 text-right text-muted-foreground">
                          {parseFloat(item.quantity).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_cost || ""}
                            onChange={(e) => handleUnitCostChange(item.id, e.target.value)}
                            className="w-32 ml-auto text-right font-mono"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium text-foreground">
                          {(item.quantity * item.unit_cost).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/20 border-t-2 border-border">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right font-bold text-foreground">
                        Subtotal
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-brass-light text-lg">
                        {subtotal.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <label className="block text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Additional Notes / Terms
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter any conditions, lead times, or notes regarding this quotation..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={submitQuote.isPending}
                className="bg-brass text-navy-deep hover:bg-brass-light min-w-[200px]"
              >
                {submitQuote.isPending ? (
                  <Loader2 className="size-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="size-5 mr-2" />
                )}
                Submit Quotation
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
