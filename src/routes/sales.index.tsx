import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  Calendar,
  User,
  CreditCard,
  Printer,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useSales, useIncrementSalePrintCount } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { usePrint } from "@/hooks/usePrint";
import { toast } from "sonner";
import { BillTemplate } from "@/components/pos/BillTemplate";

export const Route = createFileRoute("/sales/")({
  head: () => ({
    meta: [
      { title: "Sales Ledger — Fahari Nexus" },
      { name: "description", content: "Historical transaction records and sales analytics." },
    ],
  }),
  component: SalesPage,
});

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    completed: {
      label: "Completed",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Clock,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: XCircle,
    },
    refunded: {
      label: "Refunded",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: ExternalLink,
    },
  };

  const config = configs[status.toLowerCase()] || configs.pending;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
        config.color,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const incrementPrintCount = useIncrementSalePrintCount();
  const { printElement } = usePrint();

  const { data, isLoading } = useSales({
    search: search || undefined,
    status: statusFilter || undefined,
    page: page,
  });

  const sales = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const anyData = data as any;
    return anyData.results || [];
  }, [data]);

  const totalCount = useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    const anyData = data as any;
    return anyData.count || anyData.results?.length || 0;
  }, [data]);

  const hasNext = useMemo(() => {
    if (!data || Array.isArray(data)) return false;
    return !!(data as any).next;
  }, [data]);

  const hasPrev = useMemo(() => {
    if (!data || Array.isArray(data)) return false;
    return !!(data as any).previous;
  }, [data]);

  const printReceiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!selectedSale || !printReceiptRef.current) return;
    try {
      await printElement(printReceiptRef.current);
      await incrementPrintCount.mutateAsync(selectedSale.id);
      
      setSelectedSale((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          receipt_printed: true,
          print_count: (prev.print_count || 0) + 1
        };
      });

      toast.success("Receipt printed successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to print receipt");
    }
  };

  const handleDirectPrint = async (e: React.MouseEvent, sale: any) => {
    e.stopPropagation();
    setSelectedSale(sale);
    setTimeout(async () => {
      if (printReceiptRef.current) {
        try {
          await printElement(printReceiptRef.current);
          await incrementPrintCount.mutateAsync(sale.id);
          toast.success(`Receipt printed successfully for ${sale.sale_number}!`);
        } catch (err) {
          console.error(err);
          toast.error("Failed to print receipt");
        }
      }
    }, 150);
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display font-bold">
            Registry · Transaction Audit
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Sales <span className="text-brass">Ledger</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Audit and manage all register activity with live synchronization
          </p>
        </div>
        <div className="flex gap-3">
          <button className="h-10 px-4 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
            <Download className="size-3.5" />
            Export CSV
          </button>
          <Link
            to="/pos"
            className="h-10 px-5 rounded-md bg-navy text-brass-light hover:bg-navy/90 transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest border border-brass/20 shadow-xl shadow-navy/20"
          >
            <Plus className="size-3.5" />
            New Transaction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass transition-colors" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sale number or customer entity…"
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
          />
        </div>
        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass" />
          <select className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none appearance-none cursor-pointer focus:border-brass/60">
            <option>All Date Cycles</option>
            <option>Today's Shift</option>
            <option>Last 7 Business Days</option>
            <option>Current Fiscal Month</option>
          </select>
        </div>
        <div className="relative group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-brass" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-lg bg-card border border-border text-sm outline-none appearance-none cursor-pointer focus:border-brass/60"
          >
            <option value="">All Transactions</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-display uppercase tracking-[0.2em] text-muted-foreground border-b border-border bg-muted/20">
                <th className="px-8 py-4 font-bold">Reference #</th>
                <th className="px-8 py-4 font-bold">Timestamp</th>
                <th className="px-8 py-4 font-bold">Customer Profile</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Payment</th>
                <th className="px-8 py-4 font-bold text-right">Grand Total</th>
                <th className="px-8 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-20" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-32" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-40" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-6 bg-muted rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-24" />
                    </td>
                    <td className="px-8 py-5">
                      <div className="h-4 bg-muted rounded w-20 ml-auto" />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="size-4 bg-muted rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="size-16 rounded-full bg-muted/30 grid place-items-center mb-2">
                        <FileText className="size-8 opacity-20" />
                      </div>
                      <p className="font-serif italic text-xl">No transaction records found</p>
                      <p className="text-xs uppercase tracking-widest max-w-xs">
                        Adjust your search parameters or start a new sale from the POS terminal.
                      </p>
                      <Link
                        to="/pos"
                        className="mt-4 px-6 py-2 rounded-full border border-brass/40 text-brass text-[10px] uppercase tracking-widest font-bold hover:bg-brass hover:text-navy transition-all"
                      >
                        Launch Terminal
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale: any) => (
                  <tr
                    key={sale.id}
                    onClick={() => setSelectedSale(sale)}
                    className="hover:bg-muted/40 transition-all duration-300 group cursor-pointer"
                  >
                    <td className="px-8 py-5 text-sm font-bold text-brass tabular-nums group-hover:underline">
                      {sale.sale_number}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm text-foreground font-medium">
                        {new Date(sale.sale_date).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-tight flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(sale.sale_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-brass/5 border border-brass/20 grid place-items-center text-brass shadow-inner group-hover:bg-brass group-hover:text-navy transition-all">
                          <User className="size-3.5" />
                        </div>
                        <div className="text-sm text-foreground font-semibold truncate max-w-[180px]">
                          {sale.customer_name || "Walk-in Associate"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={sale.status} />
                        {sale.receipt_printed && (
                          <span className="text-[9px] bg-brass/10 text-brass border border-brass/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            P x{sale.print_count || 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <CreditCard className="size-3.5 text-brass/60" />
                        {sale.payment_method}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right text-sm font-bold tabular-nums text-foreground group-hover:text-brass transition-colors">
                      Ksh {sale.total.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => handleDirectPrint(e, sale)}
                          className={cn(
                            "p-2 rounded-md transition-all",
                            sale.receipt_printed 
                              ? "hover:bg-brass/20 text-brass" 
                              : "hover:bg-brass/10 text-muted-foreground hover:text-brass"
                          )}
                          title={sale.receipt_printed ? `Print Receipt Again (Printed ${sale.print_count}x)` : "Print Receipt"}
                        >
                          <Printer className="size-4" />
                        </button>
                        <button className="p-2 rounded-md hover:bg-brass/10 text-muted-foreground hover:text-brass transition-all">
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between bg-card border border-border px-8 py-4 rounded-xl shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing <span className="text-foreground">{sales.length}</span> of{" "}
          <span className="text-foreground">{totalCount}</span> Transactions
        </p>
        <div className="flex gap-3">
          <button
            disabled={!hasPrev || isLoading}
            onClick={() => setPage((p) => p - 1)}
            className="px-6 py-2 rounded-lg border border-border bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Previous Cycle
          </button>
          <button
            disabled={!hasNext || isLoading}
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 rounded-lg border border-border bg-card text-[10px] font-bold uppercase tracking-widest hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next Cycle
          </button>
        </div>
      </div>

      {/* Transaction Details Sheet */}
      <Sheet open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
        <SheetContent className="sm:max-w-xl w-full bg-navy border-border/40 text-foreground overflow-y-auto">
          {selectedSale && (
            <div className="space-y-6 pt-6">
              <SheetHeader className="border-b border-border/40 pb-4">
                <p className="text-[10px] uppercase tracking-widest text-brass font-bold">Transaction Record</p>
                <SheetTitle className="text-2xl font-serif font-black italic text-foreground tracking-tight flex items-center justify-between">
                  <span>{selectedSale.sale_number}</span>
                  <StatusBadge status={selectedSale.status} />
                </SheetTitle>
              </SheetHeader>

              {/* Quick Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/20 text-xs">
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px] mb-1">Date & Time</p>
                  <p className="font-semibold text-foreground">
                    {new Date(selectedSale.sale_date).toLocaleString("en-KE", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px] mb-1">Payment Method</p>
                  <p className="font-semibold text-foreground uppercase tracking-widest flex items-center gap-1">
                    <CreditCard className="size-3 text-brass" />
                    {selectedSale.payment_method}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px] mb-1">Customer</p>
                  <p className="font-semibold text-foreground truncate">{selectedSale.customer_name || "Walk-in Associate"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px] mb-1">Served By</p>
                  <p className="font-semibold text-foreground truncate">{selectedSale.cashier_name || "System Operator"}</p>
                </div>
              </div>

              {/* Receipt Print Tracking Status */}
              <div className="bg-muted/40 p-4 rounded-xl border border-border/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Receipt Status</h4>
                    <p className="text-[11px] text-muted-foreground">
                      {selectedSale.receipt_printed 
                        ? `This receipt has been printed ${selectedSale.print_count || 1} time(s).` 
                        : "This receipt has not been printed yet."}
                    </p>
                  </div>
                  <div>
                    {selectedSale.receipt_printed ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brass/10 text-brass border border-brass/30">
                        <Printer className="size-3" />
                        Printed ({selectedSale.print_count})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-muted/60 text-muted-foreground border border-border/40">
                        <Printer className="size-3 opacity-45" />
                        Not Printed
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  disabled={incrementPrintCount.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brass text-navy font-bold text-xs uppercase tracking-widest hover:bg-brass/90 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Printer className="size-4" />
                  {incrementPrintCount.isPending ? "Printing..." : selectedSale.receipt_printed ? "Print Receipt Again" : "Print Receipt"}
                </button>
              </div>

              {/* Items Purchased */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items In Order</h4>
                <div className="border border-border/40 rounded-xl overflow-hidden bg-muted/10">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/40 text-[9px] uppercase tracking-widest font-bold text-muted-foreground">
                        <th className="px-4 py-2.5">Item Name</th>
                        <th className="px-4 py-2.5 text-center">Qty</th>
                        <th className="px-4 py-2.5 text-right">Price</th>
                        <th className="px-4 py-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20 font-medium">
                      {(selectedSale.items || []).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-muted/10">
                          <td className="px-4 py-3 text-foreground font-semibold">{item.product_name}</td>
                          <td className="px-4 py-3 text-center tabular-nums">{item.quantity}</td>
                          <td className="px-4 py-3 text-right tabular-nums">Ksh {Number(item.unit_price).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-brass font-bold tabular-nums">Ksh {Number(item.subtotal || item.unit_price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-border/40 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums">Ksh {Number(selectedSale.subtotal).toLocaleString()}</span>
                </div>
                {Number(selectedSale.discount_amount) > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Discount ({selectedSale.discount_percentage}%)</span>
                    <span className="tabular-nums">- Ksh {Number(selectedSale.discount_amount).toLocaleString()}</span>
                  </div>
                )}
                {Number(selectedSale.tax_amount) > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>VAT ({selectedSale.tax_percentage}%)</span>
                    <span className="tabular-nums">Ksh {Number(selectedSale.tax_amount).toLocaleString()}</span>
                  </div>
                )}
                {Number(selectedSale.loyalty_discount_amount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Loyalty Point discount</span>
                    <span className="tabular-nums">- Ksh {Number(selectedSale.loyalty_discount_amount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/20 pt-2 mt-2">
                  <span>Total Amount</span>
                  <span className="text-brass text-base tabular-nums">Ksh {Number(selectedSale.total).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Hidden Thermal Receipt for Print Mechanism */}
      {selectedSale && (
        <div className="hidden">
          <BillTemplate
            ref={printReceiptRef}
            businessName="FAHARI NEXUS"
            address="Easy Biz Business Center, Nairobi"
            phone="+254 700 000 000"
            tableNumber={selectedSale.table_number || "COUNTER"}
            waiterName="Cashier"
            staffName={selectedSale.cashier_name || "Staff"}
            billNumber={selectedSale.sale_number}
            items={(selectedSale.items || []).map((item: any) => ({
              name: item.product_name,
              quantity: item.quantity,
              price: Number(item.unit_price)
            }))}
            subtotal={Number(selectedSale.subtotal)}
            tax={Number(selectedSale.tax_amount)}
            total={Number(selectedSale.total)}
            kraPin={selectedSale.kra_pin || "P051234567A"}
            isEtimsEnabled={true}
            serialNumber={selectedSale.serial_number || "ETMS-1234567"}
            paymentMethod={selectedSale.payment_method}
            amountPaid={Number(selectedSale.amount_paid || selectedSale.total)}
            changeAmount={Number(selectedSale.change_amount || 0)}
            branchCode={selectedSale.branch_code || "05"}
            qrUrl={selectedSale.qr_code_url || selectedSale.qr_url}
            terminalId={selectedSale.terminal_id || selectedSale.terminal || "TMN-DEFAULT"}
          />
        </div>
      )}
    </div>
  );
}
