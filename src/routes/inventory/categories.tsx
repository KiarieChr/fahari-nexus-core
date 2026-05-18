import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Plus,
  MoreHorizontal,
  FolderTree,
  Utensils,
  Wine,
  Store,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCategories } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { CategoryFormSheet } from "@/components/inventory/CategoryFormSheet";

export const Route = createFileRoute("/inventory/categories")({
  head: () => ({
    meta: [
      { title: "Product Categories — Fahari Nexus" },
      {
        name: "description",
        content: "Organize your products into Retail, Restaurant, and Bar categories.",
      },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data, isLoading } = useCategories();
  const categories = data?.results || [];

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category_type || "").toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const stats = {
    total: categories.length,
    restaurant: categories.filter((c) => c.category_type === "restaurant").length,
    bar: categories.filter((c) => c.category_type === "bar").length,
    retail: categories.filter((c) => c.category_type === "general").length,
  };

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display">
            Inventory · Organization
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Product Categories
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Manage your catalog hierarchy and section classifications
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFormOpen(true)}
            className="h-10 px-5 rounded-md bg-navy text-brass-light hover:bg-navy/90 transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest border border-brass/20 shadow-lg"
          >
            <Plus className="size-3.5" />
            New Category
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
            <FolderTree className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">{stats.total}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Total Categories
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-navy/20 flex items-center justify-center text-brass">
            <Store className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">{stats.retail}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Retail Sections
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Utensils className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">{stats.restaurant}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Kitchen Sections
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Wine className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">{stats.bar}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Bar Sections
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or type..."
          className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-border bg-card h-24" />
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <FolderTree className="size-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category: any) => (
            <div
              key={category.id}
              className="group relative p-5 rounded-xl border border-border bg-card hover:border-brass/40 hover:shadow-lg hover:shadow-brass/5 transition-all flex items-center gap-4 cursor-pointer"
            >
              <div
                className={cn(
                  "size-12 rounded-lg flex items-center justify-center shrink-0 shadow-inner",
                  category.category_type === "restaurant"
                    ? "bg-orange-500/10 text-orange-500"
                    : category.category_type === "bar"
                      ? "bg-purple-500/10 text-purple-500"
                      : "bg-navy/10 text-brass",
                )}
              >
                {category.category_type === "restaurant" ? (
                  <Utensils className="size-6" />
                ) : category.category_type === "bar" ? (
                  <Wine className="size-6" />
                ) : (
                  <Store className="size-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-brass transition-colors">
                    {category.name}
                  </h3>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-wider",
                      category.category_type === "restaurant"
                        ? "bg-orange-950 text-orange-400"
                        : category.category_type === "bar"
                          ? "bg-purple-950 text-purple-400"
                          : "bg-navy text-brass-light",
                    )}
                  >
                    {category.category_type || "Retail"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="size-3" />
                  <span className="font-display font-medium text-foreground/70">
                    {category.products_count ?? 0}
                  </span>
                  <span className="text-[10px] uppercase tracking-tighter">Products linked</span>
                </div>
              </div>

              <ChevronRight className="size-4 text-muted-foreground/30 group-hover:text-brass group-hover:translate-x-1 transition-all" />

              <button className="absolute top-2 right-2 size-6 rounded-md hover:bg-muted grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
      <CategoryFormSheet isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
