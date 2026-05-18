import React, { useState } from "react";
import { Search, Utensils, Beer, Pizza, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, Product as ApiProduct } from "@/lib/api-hooks";

interface MenuGridProps {
  onAddItem: (product: any) => void;
}

const CATEGORIES = [
  { id: "all", name: "All", icon: <Utensils className="w-4 h-4" /> },
  { id: "restaurant", name: "Kitchen", icon: <Pizza className="w-4 h-4" /> },
  { id: "bar", name: "Drinks", icon: <Beer className="w-4 h-4" /> },
];

const getFullImageUrl = (src: string | null | undefined): string | null => {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  let path = src;
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  if (!path.startsWith("/media/")) {
    path = "/media" + path;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
  const base = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
  return `${base}${path}`;
};

function MenuItemImage({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [error, setError] = useState(false);
  const fullUrl = getFullImageUrl(src);

  if (!fullUrl || error) {
    return <Utensils className="w-8 h-8 text-muted-foreground/30" />;
  }

  return (
    <img
      src={fullUrl}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export const MenuGrid: React.FC<MenuGridProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useProducts({ is_pos: true });
  const products = data?.results || [];

  const filteredProducts = products.filter((p) => {
    const BAR_CATEGORY_NAMES = ["beers", "wine", "cocktails", "spirits", "bar", "drinks", "whiskey", "whisky", "beer", "wine & cocktails"];
    const catName = (p.category_name || "").toLowerCase();
    const isBar = p.category_type === "bar" || BAR_CATEGORY_NAMES.some(b => catName.includes(b));
    const isRestaurant = p.category_type === "restaurant" || p.product_type === "menu_item";
    
    // Hide drinks that can be counted when they have 0 stock
    if (isBar && p.product_type === "product" && (p.stock_quantity === undefined || p.stock_quantity <= 0)) {
      return false;
    }

    const isFoodOrDrink = isBar || isRestaurant;
    
    let matchesCategory = activeCategory === "all";
    if (activeCategory === "restaurant" && isRestaurant) {
      matchesCategory = true;
    }
    if (activeCategory === "bar" && isBar) {
      matchesCategory = true;
    }

    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isFoodOrDrink && matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Category Bar */}
      <div className="p-4 border-b bg-card">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & View Selector */}
      <div className="p-4 flex items-center gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-soft"
          />
        </div>
        <div className="flex bg-card border rounded-2xl p-1 shadow-soft shrink-0">
          <button
            onClick={() => setViewType("grid")}
            className={cn(
              "p-2 rounded-xl transition-all",
              viewType === "grid" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType("list")}
            className={cn(
              "p-2 rounded-xl transition-all",
              viewType === "list" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Grid / List */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          viewType === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onAddItem(product)}
                  className="group flex flex-col items-start p-4 bg-card border-2 border-transparent rounded-3xl hover:border-primary/50 hover:shadow-elevated transition-all text-left animate-in fade-in duration-300"
                >
                  <div className="w-full aspect-square bg-muted rounded-2xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden relative">
                    <MenuItemImage
                      src={product.image_url || product.image}
                      alt={product.name}
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-primary/80 text-[10px] font-bold text-primary-foreground backdrop-blur-sm">
                      {product.product_type === 'service' ? (
                        "Unlimited"
                      ) : product.product_type === 'menu_item' ? (
                        `${product.portions_available ?? 0} portions`
                      ) : (
                        `${product.stock_quantity} available`
                      )}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm leading-tight mb-1 truncate w-full">
                    {product.name}
                  </h4>
                  <p className="text-primary font-black">
                    Ksh {product.selling_price.toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onAddItem(product)}
                  className="group flex items-center justify-between p-4 bg-card border-2 border-transparent rounded-3xl hover:border-primary/50 hover:shadow-elevated transition-all text-left animate-in fade-in duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center overflow-hidden shrink-0 relative">
                      <MenuItemImage
                        src={product.image_url || product.image}
                        alt={product.name}
                      />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-primary font-black text-sm mt-1">
                        Ksh {product.selling_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-muted text-[10px] font-bold text-muted-foreground">
                    {product.product_type === 'service' ? (
                      "Unlimited"
                    ) : product.product_type === 'menu_item' ? (
                      `${product.portions_available ?? 0} portions`
                    ) : (
                      `${product.stock_quantity} available`
                    )}
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
