import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCreateInspection } from "@/lib/api-hooks";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ClipboardCheck, Boxes } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  grnId?: number | null;
}

export function InspectionFormDialog({ open, onOpenChange, grnId }: Props) {
  const createInspection = useCreateInspection();

  const { data: grnsData } = useQuery({
    queryKey: ["grns"],
    queryFn: async () => { const r = await api.get("/api/v1/grns/"); return r.data?.results ?? r.data; },
    enabled: open,
  });

  const grns = (grnsData ?? []).filter((g: any) => g.status === "PENDING_INSPECTION");

  const form = useForm({
    defaultValues: {
      grn: grnId ? String(grnId) : "",
      status: "APPROVED",
      notes: "",
      items: [] as any[],
    },
  });

  const selectedGrnId = form.watch("grn");
  const { fields, replace } = useFieldArray({ control: form.control, name: "items" });

  // When a GRN is selected, load its items into the inspection lines
  useEffect(() => {
    if (selectedGrnId && grnsData) {
      const grn = grnsData.find((g: any) => String(g.id) === selectedGrnId);
      if (grn?.items) {
        replace(
          grn.items.map((item: any) => ({
            grn_item: item.id,
            product_name: item.product_name,
            received_quantity: item.received_quantity,
            inspected_quantity: item.received_quantity,
            approved_quantity: item.received_quantity,
            rejected_quantity: "0",
            rejection_reason: "",
          }))
        );
      }
    }
  }, [selectedGrnId, grnsData, replace]);

  // Auto-sync rejected_quantity = inspected - approved
  const handleQtyChange = (index: number, field: "inspected_quantity" | "approved_quantity", value: string) => {
    const current = form.getValues(`items.${index}`);
    const inspected = field === "inspected_quantity" ? Number(value) : Number(current.inspected_quantity);
    const approved = field === "approved_quantity" ? Number(value) : Number(current.approved_quantity);
    const rejected = Math.max(0, inspected - approved);
    form.setValue(`items.${index}.${field}`, value);
    form.setValue(`items.${index}.rejected_quantity`, String(rejected));
  };

  const onSubmit = async (values: any) => {
    try {
      await createInspection.mutateAsync({
        grn: Number(values.grn),
        status: values.status,
        notes: values.notes,
        items: values.items.map((item: any) => ({
          grn_item: item.grn_item,
          inspected_quantity: Number(item.inspected_quantity),
          approved_quantity: Number(item.approved_quantity),
          rejected_quantity: Number(item.rejected_quantity),
          rejection_reason: item.rejection_reason || null,
        })),
      });
      toast.success("Inspection recorded. Batches will be generated for approved items.");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to save inspection form.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-violet-500" />
            Quality Inspection Form
          </DialogTitle>
          <DialogDescription>
            Inspect received goods. <strong className="text-foreground">Approved items</strong> automatically generate product batches and update stock.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GRN to Inspect *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a GRN" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grns.length === 0 ? (
                          <SelectItem value="" disabled>No GRNs pending inspection</SelectItem>
                        ) : grns.map((g: any) => (
                          <SelectItem key={g.id} value={String(g.id)}>
                            GRN #{g.grn_number} — {g.supplier_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Outcome</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APPROVED">✅ Approved</SelectItem>
                        <SelectItem value="PARTIAL">⚠️ Partially Approved</SelectItem>
                        <SelectItem value="REJECTED">❌ Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Inspection Lines */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Boxes className="size-4 text-emerald-500" />
                  <p className="text-sm font-semibold">Inspection Lines</p>
                  <span className="text-xs text-muted-foreground ml-1">
                    (Batches auto-created for approved quantities)
                  </span>
                </div>
                {fields.map((field, index) => {
                  const item = form.watch(`items.${index}`);
                  return (
                    <div key={field.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{item.product_name}</span>
                        <span className="text-xs text-muted-foreground">Received: {item.received_quantity}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.inspected_quantity`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Inspected</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" {...f}
                                  onChange={(e) => handleQtyChange(index, "inspected_quantity", e.target.value)} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.approved_quantity`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-emerald-500">✅ Approved</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" className="border-emerald-500/30" {...f}
                                  onChange={(e) => handleQtyChange(index, "approved_quantity", e.target.value)} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.rejected_quantity`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel className="text-rose-500">❌ Rejected</FormLabel>
                              <FormControl>
                                <Input type="number" min="0" readOnly className="border-rose-500/30 bg-rose-500/5" {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      {Number(form.watch(`items.${index}.rejected_quantity`)) > 0 && (
                        <FormField
                          control={form.control}
                          name={`items.${index}.rejection_reason`}
                          render={({ field: f }) => (
                            <FormItem>
                              <FormLabel>Rejection Reason</FormLabel>
                              <FormControl>
                                <Input placeholder="Damage, expired, wrong specs..." {...f} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedGrnId && fields.length === 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center text-sm text-amber-500">
                This GRN has no items to inspect, or they're still loading.
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Overall observations, temperature on arrival, packaging condition..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createInspection.isPending || !selectedGrnId}>
                {createInspection.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Submit Inspection
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
