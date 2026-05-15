import { useState, useMemo, useEffect, useRef } from "react";
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
} from "lucide-react";
import {
  useProducts,
  useCreateSale,
  Product,
  useCompany,
  useCategories,
  useCreateKDSOrder,
  useTables,
} from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { usePrint } from "@/hooks/usePrint";
import { KOTTemplate } from "@/components/pos/KOTTemplate";

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
  const kotRef = useRef<HTMLDivElement>(null);
  const { printElement } = usePrint();
  const [activeSection, setActiveSection] = useState<PosSection>("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState("dine_in");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data, isLoading } = useProducts();
  const { data: catData } = useCategories();
  const products = data?.results || [];
  const categories = catData?.results || [];

  const createSale = useCreateSale();
  const createKDSOrder = useCreateKDSOrder();
  const { data: tableData } = useTables();
  const tables = tableData?.results || [];

  // Determine available sections
  const availableSections = useMemo(() => {
    const sections: PosSection[] = ["general"];
    if (company?.enable_restaurant_mode) sections.push("restaurant");
    if (company?.enable_bar_mode) sections.push("bar");
    return sections;
  }, [company]);

  // Reset section if disabled
  useEffect(() => {
    if (!availableSections.includes(activeSection)) {
      setActiveSection("general");
    }
  }, [availableSections, activeSection]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Filter out zero stock
      if (p.stock_quantity <= 0) return false;

      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const categoryType = p.category_type || "general";
      const matchesSection = categoryType === activeSection;

      // 2. Filter by category tab
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
  const total = subtotal + tax;

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
        if (kotRef.current) {
          await printElement(kotRef.current);
        }
      } else {
        // Retail/Bar Sale
        const saleData = {
          items: cart.map((item) => ({
            product: item.id,
            quantity: item.quantity,
            unit_price: item.selling_price,
          })),
          payment_method: "cash",
          amount_paid: total,
          tax_percentage: 16,
          order_type: orderType,
        };
        await createSale.mutateAsync(saleData);
      }

      setIsSuccess(true);
      setCart([]);
      setTableNumber("");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setIsError(err.response?.data?.error || "Transaction failed");
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
                    {p.stock_quantity} available
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
                  {/* Fallback for manual entry if needed, but primarily use database tables */}
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
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>VAT (16%)</span>
            <span className="tabular-nums font-bold text-foreground">
              KES {tax.toLocaleString()}
            </span>
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
            )}
          >
            {createSale.isPending ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Processing...
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

      {/* Hidden KOT Template for Printing */}
      <div className="hidden">
        <KOTTemplate
          ref={kotRef}
          tableNumber={tableNumber || "POS-1"}
          waiterName="POS Staff"
          orderType={orderType}
          round={1}
          items={cart.map((item) => ({ name: item.name, quantity: item.quantity }))}
        />
      </div>
    </div>
  );
}
