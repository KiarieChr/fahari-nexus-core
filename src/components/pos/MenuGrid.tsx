import React, { useState } from "react";
import { Search, Utensils, Beer, Pizza } from "lucide-react";
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

export const MenuGrid: React.FC<MenuGridProps> = ({ onAddItem }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useProducts();
  const products = data?.results || [];

  const filteredProducts = products.filter((p) => {
    const isFoodOrDrink = p.category_type === "restaurant" || p.category_type === "bar";
    const matchesCategory = activeCategory === "all" || p.category_type === activeCategory;
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

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-soft"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => onAddItem(product)}
                className="group flex flex-col items-start p-4 bg-card border-2 border-transparent rounded-3xl hover:border-primary/50 hover:shadow-elevated transition-all text-left"
              >
                <div className="w-full aspect-square bg-muted rounded-2xl mb-3 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils className="w-8 h-8 text-muted-foreground/30" />
                  )}
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
        )}
      </div>
    </div>
  );
};
