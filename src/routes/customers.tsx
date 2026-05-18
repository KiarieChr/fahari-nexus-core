import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { 
  Users, 
  Search, 
  Plus, 
  CreditCard, 
  Coins, 
  History, 
  MoreHorizontal, 
  Phone, 
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  DollarSign
} from "lucide-react";
import { 
  useCustomers, 
  useDebtPayments, 
  useLoyaltyTransactions, 
  useRecordDebtPayment,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer
} from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customer Management — Fahari Nexus" },
    ],
  }),
  component: CustomersDashboard,
});

function CustomersDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);

  const { data: customersData, isLoading } = useCustomers({ search: searchTerm });
  const customers = customersData?.results || [];

  const handleOpenPayment = (customer: any) => {
    setSelectedCustomer(customer);
    setIsPaymentDialogOpen(true);
  };

  const handleOpenHistory = (customer: any) => {
    setSelectedCustomer(customer);
    setIsHistorySheetOpen(true);
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-3xl text-foreground tracking-tight flex items-center gap-3">
            <Users className="size-8 text-brass" />
            Customer Directory
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Relationship management, credit tracking, and loyalty engagement
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm focus:border-brass/60 outline-none transition-all shadow-sm"
            />
          </div>
          <Button 
            onClick={() => {
              setCustomerToEdit(null);
              setIsFormDialogOpen(true);
            }}
            className="h-11 px-6 rounded-xl bg-navy text-brass-light font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-navy/90 transition-all shadow-lg"
          >
            <Plus className="size-4" />
            New Customer
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Customers" 
          value={customers.length.toString()} 
          icon={Users} 
          trend="+12 this month" 
          color="blue"
        />
        <KPICard 
          title="Active Credit" 
          value={`KES ${customers.reduce((acc, c) => acc + Number(c.outstanding_debt), 0).toLocaleString()}`} 
          icon={CreditCard} 
          trend="8 customers in debt" 
          color="rose"
        />
        <KPICard 
          title="Total Loyalty Pts" 
          value={customers.reduce((acc, c) => acc + Number(c.loyalty_points), 0).toLocaleString()} 
          icon={Coins} 
          trend="840 pts earned today" 
          color="amber"
        />
        <KPICard 
          title="Top Customer" 
          value={customers.sort((a, b) => Number(b.total_purchases) - Number(a.total_purchases))[0]?.name || "N/A"} 
          icon={ArrowUpRight} 
          trend="Lifetime spending" 
          color="emerald"
        />
      </div>

      {/* Table Section */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[300px] text-[10px] font-bold uppercase tracking-widest">Customer Details</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Contact Information</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Loyalty Points</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Outstanding Debt</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Total Spent</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground italic font-serif">
                    <Loader2 className="size-8 animate-spin text-brass" />
                    Syncing customer database...
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center">
                  <p className="text-muted-foreground italic font-serif">No customers found matching your criteria.</p>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer: any) => (
                <TableRow key={customer.id} className="group hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-muted flex items-center justify-center font-display text-lg text-muted-foreground">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{customer.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">ID: {customer.id.toString().padStart(4, '0')}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        {customer.phone || "---"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="size-3" />
                        {customer.email || "---"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Coins className="size-4 text-amber-500" />
                      <span className="font-bold tabular-nums">{customer.loyalty_points.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={cn(
                      "font-bold tabular-nums",
                      Number(customer.outstanding_debt) > 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      KES {Number(customer.outstanding_debt).toLocaleString()}
                    </div>
                    {Number(customer.credit_limit) > 0 && (
                      <div className="text-[10px] text-muted-foreground">Limit: KES {Number(customer.credit_limit).toLocaleString()}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold tabular-nums text-foreground">
                      KES {Number(customer.total_purchases).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0 hover:bg-muted">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manage Customer</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleOpenHistory(customer)}>
                          <History className="size-4 text-muted-foreground" />
                          Full History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleOpenPayment(customer)}>
                          <DollarSign className="size-4 text-muted-foreground" />
                          Record Payment
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer" 
                          onClick={() => {
                            setCustomerToEdit(customer);
                            setIsFormDialogOpen(true);
                          }}
                        >
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer text-rose-500 hover:text-rose-600 focus:text-rose-600 focus:bg-rose-500/10" 
                          onClick={() => {
                            setCustomerToDelete(customer);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payment Dialog */}
      <DebtPaymentDialog 
        isOpen={isPaymentDialogOpen} 
        setIsOpen={setIsPaymentDialogOpen} 
        customer={selectedCustomer} 
      />

      {/* History Sheet */}
      <CustomerHistorySheet 
        isOpen={isHistorySheetOpen} 
        setIsOpen={setIsHistorySheetOpen} 
        customer={selectedCustomer} 
      />

      {/* Customer Form (Create / Edit) Dialog */}
      <CustomerFormDialog 
        isOpen={isFormDialogOpen} 
        setIsOpen={setIsFormDialogOpen} 
        customer={customerToEdit} 
      />

      {/* Customer Delete Dialog */}
      <CustomerDeleteDialog 
        isOpen={isDeleteDialogOpen} 
        setIsOpen={setIsDeleteDialogOpen} 
        customer={customerToDelete} 
      />
    </div>
  );
}

function KPICard({ title, value, icon: Icon, trend, color }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("size-10 rounded-xl flex items-center justify-center border", colors[color])}>
          <Icon className="size-5" />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
          <p className="text-2xl font-display text-foreground mt-1 tabular-nums">{value}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-border/50 flex items-center gap-2">
        <TrendingUpIcon className="size-3 text-emerald-500" />
        <span className="text-[10px] font-medium text-muted-foreground italic font-serif">{trend}</span>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function DebtPaymentDialog({ isOpen, setIsOpen, customer }: any) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const recordPayment = useRecordDebtPayment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      await recordPayment.mutateAsync({
        customer: customer.id,
        amount: Number(amount),
        payment_method: method,
        notes
      });
      toast.success(`Payment of KES ${amount} recorded for ${customer.name}`);
      setIsOpen(false);
      setAmount("");
      setNotes("");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to record payment");
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Record Debt Payment</DialogTitle>
          <DialogDescription className="italic font-serif">
            Recording payment for {customer.name}. Current balance: KES {Number(customer.outstanding_debt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">KES</span>
              <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                className="pl-12 h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                placeholder="0.00"
                max={customer.outstanding_debt}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Method</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-muted/20 border border-border text-sm focus:border-brass/60 outline-none"
            >
              <option value="cash">Cash</option>
              <option value="mobile">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-muted/20 border border-border text-sm focus:border-brass/60 outline-none resize-none h-20"
              placeholder="e.g. Reference number or reason"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-navy text-brass-light font-bold uppercase tracking-widest text-xs shadow-lg"
              disabled={recordPayment.isPending}
            >
              {recordPayment.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <DollarSign className="size-4 mr-2" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerHistorySheet({ isOpen, setIsOpen, customer }: any) {
  if (!customer) return null;

  const { data: debtData, isLoading: loadingDebt } = useDebtPayments(customer.id);
  const { data: loyaltyData, isLoading: loadingLoyalty } = useLoyaltyTransactions(customer.id);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-[450px] sm:w-[540px] border-l border-border bg-card p-0">
        <SheetHeader className="p-8 border-b border-border bg-muted/20">
          <SheetTitle className="font-display text-2xl flex items-center gap-3">
            <History className="size-6 text-brass" />
            Transaction History
          </SheetTitle>
          <SheetDescription className="italic font-serif">
            Chronological log for {customer.name}
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="debt" className="w-full">
          <div className="px-8 pt-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-11 bg-muted p-1">
              <TabsTrigger value="debt" className="rounded-lg text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">Debt Payments</TabsTrigger>
              <TabsTrigger value="loyalty" className="rounded-lg text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm">Loyalty Points</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="debt" className="p-8 h-[calc(100vh-250px)] overflow-y-auto">
            <div className="space-y-6">
              {loadingDebt ? (
                <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-brass" /></div>
              ) : debtData?.results.length === 0 ? (
                <p className="text-center text-muted-foreground italic font-serif py-12">No debt payment history found.</p>
              ) : (
                debtData?.results.map((tx: any) => (
                  <div key={tx.id} className="relative pl-6 pb-6 border-l border-border last:pb-0">
                    <div className="absolute left-[-5px] top-0 size-2.5 rounded-full bg-rose-500 border-2 border-card shadow-sm" />
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-bold text-foreground">
                        Payment Received
                      </div>
                      <div className="text-sm font-bold text-rose-500">
                        KES {Number(tx.amount).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      <div className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(tx.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1 capitalize"><CreditCard className="size-3" /> {tx.payment_method}</div>
                    </div>
                    {tx.notes && <p className="mt-2 text-xs italic text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/50">{tx.notes}</p>}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="p-8 h-[calc(100vh-250px)] overflow-y-auto">
             <div className="space-y-6">
              {loadingLoyalty ? (
                <div className="flex justify-center py-12"><Loader2 className="size-8 animate-spin text-brass" /></div>
              ) : loyaltyData?.results.length === 0 ? (
                <p className="text-center text-muted-foreground italic font-serif py-12">No loyalty transaction history found.</p>
              ) : (
                loyaltyData?.results.map((tx: any) => (
                  <div key={tx.id} className="relative pl-6 pb-6 border-l border-border last:pb-0">
                    <div className={cn(
                      "absolute left-[-5px] top-0 size-2.5 rounded-full border-2 border-card shadow-sm",
                      tx.transaction_type === 'EARN' ? "bg-emerald-500" : "bg-amber-500"
                    )} />
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-bold text-foreground">
                        {tx.transaction_type === 'EARN' ? 'Points Earned' : 'Points Redeemed'}
                      </div>
                      <div className={cn(
                        "text-sm font-bold",
                        tx.transaction_type === 'EARN' ? "text-emerald-500" : "text-amber-500"
                      )}>
                        {tx.transaction_type === 'EARN' ? '+' : '-'}{tx.points} pts
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      <div className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(tx.date).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1 capitalize"><ArrowDownRight className="size-3" /> {tx.notes || 'Transaction'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function CustomerFormDialog({ isOpen, setIsOpen, customer }: { isOpen: boolean; setIsOpen: (open: boolean) => void; customer?: any }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [taxId, setTaxId] = useState("");
  const [notes, setNotes] = useState("");

  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  useEffect(() => {
    if (customer) {
      setName(customer.name || "");
      setEmail(customer.email || "");
      setPhone(customer.phone || "");
      setAddress(customer.address || "");
      setCreditLimit(customer.credit_limit || "0.00");
      setTaxId(customer.tax_id || "");
      setNotes(customer.notes || "");
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setCreditLimit("0.00");
      setTaxId("");
      setNotes("");
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Name and Phone Number are required");
      return;
    }

    const payload = {
      name,
      email: email || null,
      phone,
      address: address || null,
      credit_limit: parseFloat(creditLimit) || 0,
      tax_id: taxId || null,
      notes: notes || null,
    };

    try {
      if (customer) {
        await updateCustomer.mutateAsync({ id: customer.id, data: payload });
        toast.success(`Customer "${name}" successfully updated`);
      } else {
        await createCustomer.mutateAsync(payload);
        toast.success(`Customer "${name}" successfully registered`);
      }
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.phone?.[0] || "Failed to save customer");
    }
  };

  const isPending = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{customer ? "Edit Customer Profile" : "Register New Customer"}</DialogTitle>
          <DialogDescription className="italic font-serif">
            {customer ? `Modifying profile details for ${customer.name}` : "Create a new profile in the CRM database"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number *</label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                placeholder="e.g. +254 700 000 000"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                placeholder="e.g. name@domain.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credit Limit</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">KES</span>
                <Input 
                  type="number"
                  value={creditLimit} 
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="pl-12 h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">eTIMS Buyer PIN / Tax ID</label>
              <Input 
                value={taxId} 
                onChange={(e) => setTaxId(e.target.value)}
                className="h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
                placeholder="e.g. A001234567Z"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Physical Address</label>
            <Input 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              className="h-11 rounded-lg bg-muted/20 border-border focus:border-brass/60 focus:ring-0"
              placeholder="e.g. Suite 4B, Plaza One, Nairobi"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Internal Notes (Optional)</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-muted/20 border border-border text-sm focus:border-brass/60 outline-none resize-none h-20"
              placeholder="Important information, preferences, or terms"
            />
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-navy text-brass-light font-bold uppercase tracking-widest text-xs shadow-lg"
              disabled={isPending}
            >
              {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <Plus className="size-4 mr-2" />}
              {customer ? "Save Changes" : "Register Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDeleteDialog({ isOpen, setIsOpen, customer }: { isOpen: boolean; setIsOpen: (open: boolean) => void; customer?: any }) {
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = async () => {
    if (!customer) return;
    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast.success(`Customer "${customer.name}" deleted successfully`);
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete customer");
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="rounded-2xl border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-rose-500">Delete Customer Profile</DialogTitle>
          <DialogDescription className="italic font-serif">
            This action cannot be undone. All outstanding debt history for {customer.name} will be permanently archived.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{customer.name}</strong> from the system?
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-xl border border-border h-11 px-4">
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            className="h-11 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest text-xs"
            disabled={deleteCustomer.isPending}
          >
            {deleteCustomer.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
