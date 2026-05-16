import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCreateGRN } from "@/lib/api-hooks";
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
import { Loader2, Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

export function GRNCreateDialog({ 
  open, 
  onOpenChange,
  prefillPurchase 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void;
  prefillPurchase?: any;
}) {
  const createGRN = useCreateGRN();

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => { const r = await api.get("/api/v1/suppliers/"); return r.data?.results ?? r.data; },
  });
  const { data: purchasesData } = useQuery({
    queryKey: ["purchases"],
    queryFn: async () => { const r = await api.get("/api/v1/purchases/"); return r.data?.results ?? r.data; },
  });
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => { const r = await api.get("/api/v1/products/"); return r.data?.results ?? r.data; },
  });

  const suppliers = suppliersData ?? [];
  const purchases = purchasesData ?? [];
  const products = productsData ?? [];

  const form = useForm({
    defaultValues: {
      supplier: "",
      purchase: "",
      notes: "",
      items: [{ product: "", ordered_quantity: "", received_quantity: "", supplier_batch: "", manufacturing_date: "", expiry_date: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (open && prefillPurchase) {
      form.reset({
        supplier: String(prefillPurchase.supplier),
        purchase: String(prefillPurchase.id),
        notes: `Delivery for PO #${prefillPurchase.po_number}`,
        items: prefillPurchase.items.map((item: any) => ({
          product: String(item.product),
          ordered_quantity: String(item.quantity),
          received_quantity: String(item.quantity),
          supplier_batch: "",
          manufacturing_date: new Date().toISOString().split('T')[0],
          expiry_date: ""
        }))
      });
    } else if (open && !prefillPurchase) {
      form.reset({
        supplier: "",
        purchase: "",
        notes: "",
        items: [{ product: "", ordered_quantity: "", received_quantity: "", supplier_batch: "", manufacturing_date: "", expiry_date: "" }],
      });
    }
  }, [open, prefillPurchase, form]);

  const onSubmit = async (values: any) => {
    try {
      const payload = {
        supplier: Number(values.supplier),
        purchase: values.purchase ? Number(values.purchase) : null,
        notes: values.notes,
        items: values.items.map((item: any) => ({
          product: Number(item.product),
          ordered_quantity: Number(item.ordered_quantity),
          received_quantity: Number(item.received_quantity),
          supplier_batch: item.supplier_batch || null,
          manufacturing_date: item.manufacturing_date || null,
          expiry_date: item.expiry_date || null,
        })),
      };
      await createGRN.mutateAsync(payload);
      toast.success("GRN created successfully");
      form.reset();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to create GRN. Please check the details.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="size-5 text-emerald-500" />
            Record Goods Received Note (GRN)
          </DialogTitle>
          <DialogDescription>
            Log a supplier delivery. Each item will be queued for quality inspection.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Purchase Order</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PO (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {purchases.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)}>PO #{p.po_number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Received Items</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ product: "", ordered_quantity: "", received_quantity: "", supplier_batch: "", manufacturing_date: "", expiry_date: "" })}
                >
                  <Plus className="size-3 mr-1" /> Add Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => remove(index)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Product *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((p: any) => (
                                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.ordered_quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordered Qty</FormLabel>
                          <FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.received_quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Received Qty *</FormLabel>
                          <FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.supplier_batch`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Batch No.</FormLabel>
                          <FormControl><Input placeholder="e.g. LOT-2024-001" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.manufacturing_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mfg. Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.expiry_date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Condition of delivery, partial deliveries, discrepancies..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={createGRN.isPending}>
                {createGRN.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create GRN
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
