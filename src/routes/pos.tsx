import React, { useState, useMemo, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShoppingCart,
  Search,
  Barcode,
  Loader2,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  XCircle,
  Utensils,
  Wine,
  Store,
  ChevronRight,
  ClipboardList,
  Users,
  Coins,
} from "lucide-react";
import {
  useProducts,
  useCategories,
  useCreateSale,
  Product,
  useCompany,
  useCreateKDSOrder,
  useTables,
  useCustomers,
  useInventorySettings,
  useMpesaStkPush,
  useMpesaTransactions,
  useUserProfile,
} from "@/lib/api-hooks";
import { Phone, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrint } from "@/hooks/usePrint";
import { KOTTemplate } from "@/components/pos/KOTTemplate";
import { BillTemplate } from "@/components/pos/BillTemplate";
import { useEtimsConfig } from "@/lib/api-hooks";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS Terminal — Fahari Nexus" },
      {
        name: "description",
        content: "High-velocity multi-section terminal for Restaurant, Bar, and Retail.",
      },
    ],
  }),
  component: PosPage,
});

interface CartItem extends Product {
  quantity: number;
}

type PosSection = "general" | "restaurant" | "bar";

function PosPage() {
  const { data: company, isLoading: loadingCompany } = useCompany();
  const { data: profile } = useUserProfile();
  
  // Persistent Terminal ID (Unique to this browser/device)
  const [terminalId, setTerminalId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("fahari-terminal-id");
    if (!id) {
      id = "TMN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      localStorage.setItem("fahari-terminal-id", id);
    }
    setTerminalId(id);
  }, []);

  const kotRef = useRef<HTMLDivElement>(null);
  const billRef = useRef<HTMLDivElement>(null);
  const { printElement } = usePrint();
  
  // Read section from URL param (?section=bar / ?section=restaurant)
  const initialSection = (typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("section") as PosSection | null
    : null) ?? "general";
  
  const [activeSection, setActiveSection] = useState<PosSection>(initialSection);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine_in");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  // New CRM State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [isMpesaWaiting, setIsMpesaWaiting] = useState(false);

  const { data, isLoading } = useProducts({ is_pos: true });
  const { data: catData } = useCategories();
  
  const products = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.results || [];
  }, [data]);

  const categories = useMemo(() => {
    if (!catData) return [];
    if (Array.isArray(catData)) return catData;
    return catData.results || [];
  }, [catData]);

  const createSale = useCreateSale();
  const createKDSOrder = useCreateKDSOrder();
  const { data: tableData } = useTables();
  const tables = tableData?.results || [];

  const { data: customerData } = useCustomers();
  const customers = customerData?.results || [];
  
  const { data: invSettings } = useInventorySettings();
  const { data: etimsData } = useEtimsConfig();
  const activeEtims = etimsData?.find(e => e.is_active);

  const selectedCustomer = useMemo(() => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (customer?.phone && !mpesaPhone) {
      setMpesaPhone(customer.phone);
    }
    return customer;
  }, [customers, selectedCustomerId, mpesaPhone]);

  // Determine available sections
  const availableSections = useMemo(() => {
    return ["general"] as PosSection[];
  }, []);

  // Reset section if disabled
  useEffect(() => {
    if (!availableSections.includes(activeSection)) {
      setActiveSection("general");
    }
  }, [availableSections, activeSection]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filter out items with no stock (but keep if stock_quantity is undefined/null — show all)
      const stock = p.product_type === 'menu_item' ? Number(p.portions_available ?? 0) : Number(p.stock_quantity ?? 0);
      const isService = p.product_type === 'service';
      const isMenuItem = p.product_type === 'menu_item';
      const allowNegative = invSettings?.allow_negative_inventory;

      if (stock <= 0 && !isService && !isMenuItem && !allowNegative) return false;

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Products with null category_type default to 'general'
      const categoryType = (p.category_type as string | null) || "general";
      const matchesSection = categoryType === activeSection;

      // Filter by category tab
      const matchesCategory = activeCategory === "all" || p.category_name === activeCategory;

      return matchesSearch && matchesSection && matchesCategory;
    });
  }, [products, searchQuery, activeSection, activeCategory]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const subtotal = cart.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
  const tax = subtotal * 0.16;
  
  const loyaltyDiscount = useMemo(() => {
    if (!invSettings?.enable_loyalty_program || !loyaltyPointsToRedeem) return 0;
    return loyaltyPointsToRedeem * (invSettings.loyalty_point_value || 1);
  }, [invSettings, loyaltyPointsToRedeem]);

  const total = Math.max(0, subtotal + tax - loyaltyDiscount);

  // Sync amount paid for non-credit sales
  useEffect(() => {
    if (paymentMethod !== 'credit') {
      setAmountPaid(total.toString());
    }
  }, [total, paymentMethod]);

  const stkPush = useMpesaStkPush();
  const { data: mpesaTxData } = useMpesaTransactions(checkoutRequestId || undefined);

  // Auto-complete sale when M-Pesa succeeds
  useEffect(() => {
    const tx = mpesaTxData?.results?.[0];
    if (tx?.status === 'SUCCESS' && isMpesaWaiting) {
      setIsMpesaWaiting(false);
      setCheckoutRequestId(null);
      finalizeSale();
    } else if (tx?.status === 'FAILED' && isMpesaWaiting) {
      setIsMpesaWaiting(false);
      setCheckoutRequestId(null);
      setIsError("M-Pesa payment failed or was cancelled.");
    }
  }, [mpesaTxData, isMpesaWaiting]);

  const finalizeSale = async () => {
    const saleData = {
      items: cart.map((item) => ({
        product: item.id,
        quantity: item.quantity,
        unit_price: item.selling_price,
      })),
      customer: selectedCustomerId,
      payment_method: paymentMethod,
      amount_paid: Number(amountPaid),
      loyalty_points_redeemed: loyaltyPointsToRedeem,
      tax_percentage: 16,
      order_type: orderType,
    };
    await createSale.mutateAsync(saleData);
    
    setIsSuccess(true);
    // setCart([]) // MOVED TO handleCheckout
    setTableNumber("");
    setSelectedCustomerId(null);
    setLoyaltyPointsToRedeem(0);
    setPaymentMethod("cash");
    setMpesaPhone("");
    setTimeout(() => setIsSuccess(false), 3000);
  };

  const handleCheckout = async () => {
    try {
      if (activeSection === "restaurant") {
        // Send to KDS instead of recording a Sale
        const kdsData = {
          table_number: tableNumber,
          order_type: orderType,
          items: cart.map((item) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.quantity,
            station: "kitchen",
          })),
        };
        await createKDSOrder.mutateAsync(kdsData);

        // Print physical ticket
        // Filter items for KOT (only restaurant/bar)
        const kotItems = cart.filter(item => 
          item.category_type === "restaurant" || item.category_type === "bar"
        );

        if (kotRef.current && kotItems.length > 0) {
          await printElement(kotRef.current);
        }
        
        // Also print Bill for restaurant
        if (billRef.current) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Slight delay between prints
          await printElement(billRef.current);
        }
        
        setIsSuccess(true);
        setCart([]); // Clear cart after printing
        setTableNumber("");
        setTimeout(() => setIsSuccess(false), 3000);
      } else if (paymentMethod === 'mpesa') {
        if (!mpesaPhone) {
          setIsError("Please enter an M-Pesa phone number");
          return;
        }
        const response = await stkPush.mutateAsync({
          phone: mpesaPhone,
          amount: total,
          // metadata could go here
        });
        setCheckoutRequestId(response.CheckoutRequestID);
        setIsMpesaWaiting(true);
      } else {
        await finalizeSale();
        // Print Receipt for Retail/Bar
        if (billRef.current) {
          await printElement(billRef.current);
        }
        setCart([]); // Clear cart after printing
      }
    } catch (err: any) {
      setIsError(err.response?.data?.error || err.message || "Transaction failed");
      setIsMpesaWaiting(false);
      setTimeout(() => setIsError(null), 5000);
    }
  };

  const sectionConfig = {
    general: { label: "Retail Shop", icon: Store, color: "bg-navy", text: "text-brass" },
    restaurant: {
      label: "Kitchen / Restaurant",
      icon: Utensils,
      color: "bg-orange-950",
      text: "text-orange-400",
    },
    bar: { label: "Bar / Drinks", icon: Wine, color: "bg-purple-950", text: "text-purple-400" },
  };

  return (
    <div className="px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 max-w-[1700px] mx-auto min-h-[calc(100vh-100px)]">
      {/* Catalog */}
      <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden flex flex-col h-full">
        {/* Terminal Header */}
        <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl text-foreground tracking-wide flex items-center gap-2">
              Terminal 01
              <span className="inline-flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-tighter">
              Multi-Section POS — {sectionConfig[activeSection].label}
            </p>
          </div>
          {availableSections.length > 1 && (
            <div className="flex bg-muted/40 p-1 rounded-xl border border-border">
              {availableSections.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSection(s)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                    activeSection === s
                      ? `${sectionConfig[s].color} ${sectionConfig[s].text} shadow-lg`
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s === "general" && <Store className="size-3.5" />}
                  {s === "restaurant" && <Utensils className="size-3.5" />}
                  {s === "bar" && <Wine className="size-3.5" />}
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSection} items...`}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-muted/40 border border-border text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
            />
          </div>
          <button className="h-11 px-4 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 text-sm font-medium">
            <Barcode className="size-4" />
            Scan
          </button>
        </div>
        {/* Category Tabs */}
        <div className="px-6 py-2 border-b border-border bg-muted/5 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
              activeCategory === "all"
                ? "bg-foreground text-background border-foreground shadow-lg"
                : "bg-background text-muted-foreground border-border hover:bg-muted",
            )}
          >
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                activeCategory === cat.name
                  ? "bg-foreground text-background border-foreground shadow-lg"
                  : "bg-background text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto max-h-[700px]">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground gap-4">
              <Loader2 className="size-10 animate-spin text-brass" />
              <p className="font-serif italic text-lg">Syncing Inventory...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-muted-foreground border-2 border-dashed border-border rounded-2xl">
              <div className="size-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                {activeSection === "general" && <Store className="size-10 opacity-20" />}
                {activeSection === "restaurant" && <Utensils className="size-10 opacity-20" />}
                {activeSection === "bar" && <Wine className="size-10 opacity-20" />}
              </div>
              <p className="text-lg font-medium">
                No items in {sectionConfig[activeSection].label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different section or clear search.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-brass hover:underline mt-4 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="group text-left rounded-xl border border-border bg-background hover:border-brass/40 hover:shadow-xl hover:shadow-brass/5 transition-all p-4 active:scale-95"
              >
                <div className="aspect-square rounded-lg bg-gradient-to-br from-muted to-muted/30 mb-4 overflow-hidden relative">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-muted-foreground group-hover:text-brass transition-colors">
                      {activeSection === "restaurant" ? (
                        <Utensils className="size-10 opacity-20" />
                      ) : (
                        <ShoppingCart className="size-10 opacity-20" />
                      )}
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-navy/80 text-[10px] font-display text-brass-light backdrop-blur-sm">
                    {p.product_type === 'service' ? (
                      "Unlimited"
                    ) : p.product_type === 'menu_item' ? (
                      `${p.portions_available ?? 0} portions`
                    ) : (
                      `${p.stock_quantity} available`
                    )}
                  </div>
                </div>
                <div className="text-sm font-semibold text-foreground truncate group-hover:text-brass transition-colors">
                  {p.name}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-display">
                    {p.sku}
                  </span>
                  <span className="text-base font-bold tabular-nums text-foreground">
                    KES {p.selling_price.toLocaleString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Checkout Sidebar */}
      <aside className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden flex flex-col h-full sticky top-6">
        <div
          className={cn(
            "px-6 py-6 transition-colors duration-500 flex items-center justify-between",
            activeSection === "general"
              ? "bg-navy"
              : activeSection === "restaurant"
                ? "bg-orange-950"
                : "bg-purple-950",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShoppingCart className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-display tracking-widest text-lg leading-tight uppercase text-white">
                Checkout
              </h2>
              <p className="text-[10px] opacity-60 uppercase tracking-widest font-medium text-white">
                {activeSection} Mode
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display text-white tabular-nums leading-none">
              {cart.length}
            </div>
            <div className="text-[10px] uppercase tracking-tighter opacity-60 text-white">
              Items
            </div>
          </div>
        </div>

        {/* Status Overlays */}
        {isSuccess && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="size-5 shrink-0" />
            <div className="text-xs font-medium">Order Placed Successfully!</div>
          </div>
        )}
        {isError && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <XCircle className="size-5 shrink-0" />
            <div className="text-xs font-medium">{isError}</div>
          </div>
        )}

        {/* Restaurant Controls */}
        {activeSection !== "general" && (
          <div className="px-4 mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                Table No.
              </label>
              <div className="relative">
                <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/30 border border-border text-xs focus:ring-2 focus:ring-brass/20 outline-none appearance-none"
                >
                  <option value="">Select Table</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.table_number} disabled={t.status === "occupied"}>
                      {t.name} {t.status === "occupied" ? "(Occupied)" : ""}
                    </option>
                  ))}
                  {!tables.length && <option value="POS-1">Terminal Default</option>}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                Service
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-muted/30 border border-border text-xs focus:ring-2 focus:ring-brass/20 outline-none appearance-none"
              >
                <option value="dine_in">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        )}

        {/* Customer Selection */}
        <div className="px-4 mt-6 space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1 flex justify-between">
              Customer Selection
              {selectedCustomer && (
                <span className="text-brass normal-case tracking-normal">
                  Pts: {selectedCustomer.loyalty_points} | Debt: KES {selectedCustomer.outstanding_debt}
                </span>
              )}
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <select
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-muted/30 border border-border text-xs focus:ring-2 focus:ring-brass/20 outline-none appearance-none"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || "No phone"})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loyalty Redemption */}
          {invSettings?.enable_loyalty_program && selectedCustomer && selectedCustomer.loyalty_points >= (invSettings?.min_points_to_redeem ?? 0) && (
            <div className="p-4 rounded-xl border border-brass/20 bg-brass/5 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="size-4 text-brass" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
                    Loyalty Rewards
                  </span>
                </div>
                <span className="text-[10px] font-medium text-brass">
                  Value: KES {invSettings.loyalty_point_value}/pt
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  max={selectedCustomer.loyalty_points}
                  value={loyaltyPointsToRedeem || ""}
                  onChange={(e) => setLoyaltyPointsToRedeem(Math.min(selectedCustomer.loyalty_points, Number(e.target.value)))}
                  placeholder="Points to use..."
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-xs outline-none focus:border-brass/40"
                />
                <button 
                  onClick={() => setLoyaltyPointsToRedeem(0)}
                  className="px-3 h-9 rounded-lg border border-border text-[10px] font-bold uppercase hover:bg-muted"
                >
                  Clear
                </button>
              </div>
              {loyaltyDiscount > 0 && (
                <p className="text-[10px] text-emerald-500 font-medium">
                  Applying KES {loyaltyDiscount.toLocaleString()} discount
                </p>
              )}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
              <div className="size-20 mx-auto rounded-full border-2 border-dashed border-border grid place-items-center text-muted-foreground mb-6">
                <ShoppingCart className="size-10" />
              </div>
              <div className="font-display text-lg tracking-wide uppercase">Empty Basket</div>
              <p className="text-xs max-w-[180px] mx-auto mt-2 italic">
                Awaiting customer selection...
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="group p-3 rounded-xl border border-border bg-muted/20 hover:border-brass/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-lg bg-background border border-border overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="size-full object-cover" />
                    ) : (
                      <div className="size-full grid place-items-center text-muted-foreground bg-muted/10">
                        {item.category_type === "restaurant" ? (
                          <Utensils className="size-5 opacity-20" />
                        ) : (
                          <Barcode className="size-5 opacity-20" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate text-foreground">
                      {item.name}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="size-7 rounded-md hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center active:scale-90"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold tabular-nums w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="size-7 rounded-md hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center active:scale-90"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-foreground">
                          KES {(item.selling_price * item.quantity).toLocaleString()}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] text-rose-500 hover:text-rose-600 font-medium transition-colors mt-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="px-6 py-6 bg-muted/30 border-t border-border space-y-3">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums font-bold text-foreground">
              KES {subtotal.toLocaleString()}
            </span>
          </div>
          {/* Tax row removed as per user request */}
          {loyaltyDiscount > 0 && (
            <div className="flex justify-between text-xs font-medium text-emerald-500">
              <span>Loyalty Discount</span>
              <span className="tabular-nums font-bold">
                - KES {loyaltyDiscount.toLocaleString()}
              </span>
            </div>
          )}

          {/* Payment Method & Amount Paid */}
          <div className="pt-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex-1 h-9 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                  paymentMethod === "cash" ? "bg-navy text-white border-navy" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod("credit")}
                disabled={!selectedCustomerId}
                className={cn(
                  "flex-1 h-9 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                  paymentMethod === "credit" ? "bg-rose-900 text-white border-rose-900" : "border-border text-muted-foreground hover:bg-muted disabled:opacity-30"
                )}
              >
                Debt / Credit
              </button>
              <button
                onClick={() => setPaymentMethod("mpesa")}
                className={cn(
                  "flex-1 h-9 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all",
                  paymentMethod === "mpesa" ? "bg-emerald-900 text-white border-emerald-900" : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                M-Pesa
              </button>
            </div>
            
            {paymentMethod === "mpesa" && (
              <div className="relative animate-in slide-in-from-top-2 duration-200">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm font-medium outline-none focus:border-emerald-500/40"
                  placeholder="Enter M-Pesa Number..."
                />
              </div>
            )}
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                PAID:
              </span>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full h-10 pl-12 pr-4 rounded-lg bg-muted/20 border border-border text-sm font-bold tabular-nums outline-none focus:border-brass/40"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-border">
            <div className="font-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Amount Due
            </div>
            <div className="text-3xl font-display text-foreground tabular-nums tracking-tighter">
              <span className="text-sm font-sans font-bold text-brass mr-1">KES</span>
              {total.toLocaleString()}
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSale.isPending}
            className={cn(
              "w-full mt-6 h-14 rounded-xl text-white font-bold uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 group",
              activeSection === "general"
                ? "bg-navy shadow-navy/20"
                : activeSection === "restaurant"
                  ? "bg-orange-800 shadow-orange-950/20"
                  : "bg-purple-800 shadow-purple-950/20",
              isMpesaWaiting && "bg-emerald-600 animate-pulse"
            )}
          >
            {createSale.isPending || isMpesaWaiting ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                {isMpesaWaiting ? "Awaiting Payment PIN..." : "Processing..."}
              </>
            ) : (
              <>
                {activeSection === "restaurant" ? "Send to Kitchen" : "Complete Sale"}
                <CheckCircle2 className="size-5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Hidden Receipts for Printing */}
      <div className="hidden">
        <KOTTemplate
          ref={kotRef}
          tableNumber={tableNumber || "POS-1"}
          waiterName="POS Staff"
          orderType={orderType}
          round={1}
          items={cart
            .filter(item => item.category_type === "restaurant" || item.category_type === "bar")
            .map((item) => ({ name: item.name, quantity: item.quantity }))
          }
        />
        <BillTemplate
          ref={billRef}
          businessName={company?.name}
          address={company?.primary_address}
          phone={company?.phone_number}
          logoUrl={company?.logo}
          tableNumber={tableNumber || "COUNTER"}
          terminalId={terminalId}
          staffName={profile?.first_name || "STAFF"}
          waiterName={
            cart.some(item => item.category_type === "restaurant" || item.category_type === "bar")
              ? "Waiter"
              : "Staff"
          }
          billNumber={`BN-${Date.now().toString().slice(-6)}`}
          items={cart.map(item => ({ 
            name: item.name, 
            quantity: item.quantity, 
            price: item.selling_price 
          }))}
          subtotal={subtotal}
          tax={tax}
          total={total}
          kraPin={activeEtims?.kra_pin}
          buyerPin={selectedCustomer?.tax_id}
          serialNumber={activeEtims?.serial_number}
          isEtimsEnabled={!!activeEtims}
        />
      </div>
    </div>
  );
}
