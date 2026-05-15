import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings,
  Utensils,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
  Table as TableIcon,
  Store,
  ShoppingBag,
  Info,
  ShieldCheck,
} from "lucide-react";
import { useTables, useCompany, Table } from "@/lib/api-hooks";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/sales/settings")({
  component: SalesSettingsPage,
});

function SalesSettingsPage() {
  const { data: company } = useCompany();
  const { data: tableData, isLoading } = useTables();
  const tables = tableData?.results || [];
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    table_number: "",
    capacity: 4,
  });

  const createTable = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.post("/api/v1/restaurant/tables/", {
        ...data,
        company: company?.id,
        branch: 1, // Default branch for now
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsAdding(false);
      setFormData({ name: "", table_number: "", capacity: 4 });
    },
  });

  const updateTable = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const { data: response } = await api.patch(`/api/v1/restaurant/tables/${id}/`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setEditingId(null);
    },
  });

  const deleteTable = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/v1/restaurant/tables/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const updateCompanySettings = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.put("/api/v1/company/", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });

  const handleEdit = (table: Table) => {
    setEditingId(table.id);
    setFormData({
      name: table.name,
      table_number: table.table_number,
      capacity: table.capacity,
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Settings className="size-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your sales, terminal, and section preferences.
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Section: Restaurant Table Management */}
        {company?.enable_restaurant_mode && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="size-5 text-primary" />
                <h2 className="text-xl font-semibold">Restaurant Tables</h2>
              </div>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Plus className="size-4" />
                  Add New Table
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isAdding && (
                <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">
                      New Table
                    </span>
                    <button onClick={() => setIsAdding(false)}>
                      <X className="size-4" />
                    </button>
                  </div>
                  <input
                    placeholder="Table Name (e.g. Table 01)"
                    className="w-full px-4 py-2 rounded-lg bg-background border outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder="Number (T1)"
                      className="px-4 py-2 rounded-lg bg-background border outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.table_number}
                      onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Seats"
                      className="px-4 py-2 rounded-lg bg-background border outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <button
                    disabled={createTable.isPending}
                    onClick={() => createTable.mutate(formData)}
                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold flex items-center justify-center gap-2"
                  >
                    {createTable.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save Table
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="col-span-full py-12 flex justify-center italic text-muted-foreground">
                  Loading floor plan...
                </div>
              ) : (
                tables.map((table) => (
                  <div
                    key={table.id}
                    className="p-6 rounded-2xl border bg-card hover:border-primary/40 transition-all group relative"
                  >
                    {editingId === table.id ? (
                      <div className="space-y-3">
                        <input
                          className="w-full px-3 py-1.5 rounded-lg border text-sm"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-1.5 rounded-lg border text-sm"
                            value={formData.table_number}
                            onChange={(e) =>
                              setFormData({ ...formData, table_number: e.target.value })
                            }
                          />
                          <input
                            type="number"
                            className="px-3 py-1.5 rounded-lg border text-sm"
                            value={formData.capacity}
                            onChange={(e) =>
                              setFormData({ ...formData, capacity: parseInt(e.target.value) })
                            }
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => updateTable.mutate({ id: table.id, data: formData })}
                            className="flex-1 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 border rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "size-10 rounded-xl flex items-center justify-center text-lg font-bold",
                                table.status === "occupied"
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-emerald-100 text-emerald-600",
                              )}
                            >
                              {table.table_number}
                            </div>
                            <div>
                              <div className="font-bold">{table.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {table.capacity} Seats • {table.status}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(table)}
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this table?")) deleteTable.mutate(table.id);
                            }}
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* Section: Operational Modes */}
        <section className="space-y-6 pt-8 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="size-5 text-brass" />
              <h2 className="text-xl font-semibold">Operational Modes</h2>
            </div>
            <div className="px-3 py-1 rounded-full bg-brass/10 border border-brass/20 text-brass text-[9px] font-bold uppercase tracking-widest">
              Advanced Configuration
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl border border-border bg-card hover:border-brass/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-xl bg-brass/5 border border-brass/10 flex items-center justify-center text-brass">
                  <ShoppingBag className="size-5" />
                </div>
                <button
                  onClick={() =>
                    updateCompanySettings.mutate({
                      enable_retail_mode: !company?.enable_retail_mode,
                    })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    company?.enable_retail_mode ? "bg-emerald-500" : "bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 size-4 rounded-full bg-white transition-all shadow-sm",
                      company?.enable_retail_mode ? "right-1" : "left-1",
                    )}
                  />
                </button>
              </div>
              <h3 className="font-bold text-foreground">Activate Retail Shop</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Enable standard B2C POS operations. Turning this off will hide "General Items" and
                retail-specific categories from the terminal.
              </p>
              {!company?.enable_retail_mode && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center gap-3">
                  <Info className="size-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-600 font-medium">
                    All General Category items are currently suppressed in the POS.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card hover:border-brass/30 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="size-10 rounded-xl bg-brass/5 border border-brass/10 flex items-center justify-center text-brass">
                  <ShieldCheck className="size-5" />
                </div>
                <button
                  onClick={() =>
                    updateCompanySettings.mutate({
                      enable_wholesale_mode: !company?.enable_wholesale_mode,
                    })
                  }
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    company?.enable_wholesale_mode ? "bg-emerald-500" : "bg-muted",
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 size-4 rounded-full bg-white transition-all shadow-sm",
                      company?.enable_wholesale_mode ? "right-1" : "left-1",
                    )}
                  />
                </button>
              </div>
              <h3 className="font-bold text-foreground">Wholesale / B2B Mode</h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Activates specialized checkout flows for bulk orders, credit management, and tiered
                pricing structures.
              </p>
            </div>
          </div>
        </section>

        {/* Other Sales Settings */}
        <section className="space-y-6 pt-8 border-t">
          <div className="flex items-center gap-2">
            <TableIcon className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Terminal Configuration</h2>
          </div>
          <div className="grid gap-4 max-w-xl">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div>
                <div className="font-medium">Tax-Inclusive Pricing</div>
                <div className="text-sm text-muted-foreground">Prices shown include VAT (16%)</div>
              </div>
              <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                <div className="absolute right-1 top-1 size-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div>
                <div className="font-medium">Auto-Print Receipts</div>
                <div className="text-sm text-muted-foreground">
                  Print thermal receipt automatically on checkout
                </div>
              </div>
              <div className="h-6 w-11 rounded-full bg-muted relative cursor-pointer">
                <div className="absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
