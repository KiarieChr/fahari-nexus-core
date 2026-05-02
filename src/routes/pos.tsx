import { createFileRoute } from "@tanstack/react-router";
import { ShoppingCart, Search, Barcode } from "lucide-react";

export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "Point of Sale — Fahari Nexus" },
      { name: "description", content: "High-velocity checkout terminal for in-store sales." },
    ],
  }),
  component: PosPage,
});

const products = [
  { sku: "GRC005", name: "Baking Flour 2kg", price: 350 },
  { sku: "HPC001", name: "Bar Soap 175g", price: 120 },
  { sku: "GRC012", name: "Cooking Oil 5L", price: 1450 },
  { sku: "GRC003", name: "Sugar 2kg", price: 280 },
  { sku: "BEV007", name: "Tea Leaves 500g", price: 320 },
  { sku: "DRY009", name: "Rice 5kg", price: 920 },
];

function PosPage() {
  return (
    <div className="px-6 md:px-8 py-6 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 max-w-[1600px] mx-auto">
      {/* Catalog */}
      <section className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-border">
          <h1 className="font-display text-xl text-foreground tracking-wide">Point of Sale</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Scan, search, or tap to add</p>
        </div>

        <div className="px-6 py-4 flex items-center gap-2 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              placeholder="Search products by name or SKU…"
              className="w-full h-10 pl-9 pr-3 rounded-md bg-muted/40 border border-border text-sm outline-none focus:border-brass/60 focus:ring-2 focus:ring-brass/20"
            />
          </div>
          <button className="h-10 px-3 rounded-md border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Barcode className="size-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
          {products.map((p) => (
            <button
              key={p.sku}
              className="group text-left rounded-lg border border-border bg-background hover:border-brass/50 hover:shadow-md transition-all p-4"
            >
              <div className="aspect-[4/3] rounded-md bg-gradient-to-br from-muted to-muted/40 mb-3 grid place-items-center text-muted-foreground group-hover:text-brass transition-colors">
                <Barcode className="size-8" />
              </div>
              <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] uppercase tracking-widest text-brass font-display">
                  {p.sku}
                </span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  Ksh {p.price.toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Cart */}
      <aside className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
        <div className="px-5 py-5 bg-gradient-to-br from-navy-deep to-navy text-brass-light flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            <h2 className="font-display tracking-wider text-lg">Current Sale</h2>
          </div>
          <div className="flex gap-4 text-[10px] uppercase tracking-widest">
            <div>
              <div className="text-xl font-display text-brass-light tabular-nums">0</div>
              <div className="text-brass-light/60">Items</div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/40 border border-border">
            <div className="size-7 rounded-full bg-brass/15 grid place-items-center text-brass text-xs font-semibold">
              W
            </div>
            <div className="text-sm flex-1">Walk-in Customer</div>
          </div>
        </div>

        <div className="flex-1 grid place-items-center px-6 py-12 text-center">
          <div>
            <div className="size-16 mx-auto rounded-full border-2 border-dashed border-border grid place-items-center text-muted-foreground mb-4">
              <ShoppingCart className="size-7" />
            </div>
            <div className="font-display text-foreground">Cart is empty</div>
            <div className="text-xs text-muted-foreground mt-1">
              Add products to start a sale
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">Ksh 0</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (16%)</span>
            <span className="tabular-nums">Ksh 0</span>
          </div>
          <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums text-brass">Ksh 0</span>
          </div>
          <button
            disabled
            className="w-full mt-3 h-12 rounded-md bg-gradient-to-r from-brass-dark to-brass text-navy-deep font-medium tracking-wide shadow-lg shadow-brass/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Charge
          </button>
        </div>
      </aside>
    </div>
  );
}