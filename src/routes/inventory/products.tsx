import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Layers,
  Tag,
  Loader2,
  Image as ImageIcon,
  Utensils,
  Wine,
  ArrowRight,
  CircleDollarSign,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  Download,
  Upload,
  Zap,
  X,
  BookOpen,
  RefreshCw,
  GitBranch,
} from "lucide-react";
import {
  useProducts,
  useProductDetail,
  useProductBatches,
  Product,
  useExportExcel,
  useUserProfile,
  useSyncProductStock,
  useCompany,
} from "@/lib/api-hooks";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormSheet } from "@/components/inventory/ProductFormSheet";
import { BulkUploadDialog } from "@/components/inventory/BulkUploadDialog";
import { StockJournalDialog } from "@/components/inventory/StockJournalDialog";
import { CreateMainBranchDialog } from "@/components/inventory/CreateMainBranchDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/inventory/products")({
  head: () => ({
    meta: [
      { title: "Product Catalog — Fahari Nexus" },
      { name: "description", content: "Manage your SKU catalog, pricing, and stock levels." },
    ],
  }),
  component: ProductsPage,
});

type SectionFilter = "all" | "general" | "restaurant" | "bar" | "service";

function ProductDetailsSheet({
  productId,
  isOpen,
  onOpenChange,
  setEditingProduct,
  setIsFormOpen,
  onOpenJournal,
}: {
  productId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setEditingProduct: (p: Product | null) => void;
  setIsFormOpen: (open: boolean) => void;
  onOpenJournal: (product: Product) => void;
}) {
  const { data: product, isLoading: isLoadingProduct } = useProductDetail(productId);
  const { data: batchesData, isLoading: isLoadingBatches } = useProductBatches(productId);

  const batches = useMemo(() => {
    if (!batchesData) return [];
    if (Array.isArray(batchesData)) return batchesData;
    const anyData = batchesData as any;
    return anyData.results || [];
  }, [batchesData]);

  const formatKES = (val: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const financials = useMemo(() => {
    if (!product) return null;
    const cost = product.cost_price || 0;
    const sale = product.selling_price || 0;
    const qty = product.stock_quantity || 0;

    const totalCost = Number(cost) * Number(qty);
    const totalSale = Number(sale) * Number(qty);
    const profit = totalSale - totalCost;
    const margin = sale > 0 ? ((Number(sale) - Number(cost)) / Number(sale)) * 100 : 0;

    return { totalCost, totalSale, profit, margin };
  }, [product]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl border-l border-brass/20 bg-[#0A0D14] text-foreground p-0 overflow-hidden flex flex-col">
        <div className="sr-only">
          <SheetTitle>Product Details</SheetTitle>
          <SheetDescription>View detailed information and batch history for this product.</SheetDescription>
        </div>
        {isLoadingProduct ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="size-8 text-brass animate-spin" />
          </div>
        ) : product ? (
          <>
            <div className="h-48 bg-muted/20 relative border-b border-white/5">
              {getFullImageUrl((product as any).image_url || product.image) ? (
                <img src={getFullImageUrl((product as any).image_url || product.image)!} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-10">
                  <Package className="size-20 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge
                  variant="outline"
                  className="mb-2 bg-brass/10 border-brass/30 text-brass uppercase tracking-widest text-[8px]"
                >
                  {product.category_name}
                </Badge>
                <h2 className="text-2xl font-display text-white mb-1">{product.name}</h2>
                <div className="flex items-center gap-3">
                  <p className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">
                    SKU: {product.sku}
                  </p>
                  <span className="text-white/10">|</span>
                  <p className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">
                    {product.category_type || "Retail"}
                  </p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Layers className="size-3.5" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        In Stock
                      </span>
                    </div>
                    <div
                      className={cn(
                        "text-3xl font-display",
                        product.stock_quantity <= 5 ? "text-rose-500" : "text-emerald-500",
                      )}
                    >
                      {product.stock_quantity}{" "}
                      <span className="text-xs text-muted-foreground font-sans">units</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <CircleDollarSign className="size-3.5" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">
                        Selling Price
                      </span>
                    </div>
                    <div className="text-3xl font-display text-brass">
                      {formatKES(product.selling_price)}
                    </div>
                  </div>
                </div>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <TrendingUp className="size-3.5 text-brass" />
                      Financial Valuation
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Purchase Cost
                        </span>
                        <span className="font-medium text-sm tabular-nums text-white">
                          {formatKES(product.cost_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Gross Margin
                        </span>
                        <span className="font-medium text-sm tabular-nums text-emerald-500">
                          {financials?.margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-6 rounded-xl bg-gradient-to-br from-brass/10 to-transparent border border-brass/20 flex flex-col justify-center">
                      <p className="text-[10px] uppercase tracking-widest text-brass mb-1 font-bold">
                        Expected Gross Profit
                      </p>
                      <div className="text-3xl font-display text-white">
                        {formatKES(financials?.profit || 0)}
                      </div>
                    </div>
                  </div>
                </section>

                <Separator className="bg-white/5" />

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                      <Clock className="size-3.5 text-brass" />
                      Batch Tracking & Expiry
                    </h3>
                  </div>

                  {isLoadingBatches ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
                      <Loader2 className="size-4 animate-spin text-brass" />
                      <span className="text-xs uppercase tracking-widest">
                        Scanning inventory...
                      </span>
                    </div>
                  ) : batches && batches.length > 0 ? (
                    <div className="rounded-xl border border-white/5 bg-white/[0.01] overflow-hidden shadow-2xl">
                      <Table>
                        <TableHeader className="bg-white/[0.03]">
                          <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-[9px] uppercase tracking-widest h-10 text-muted-foreground">
                              Batch
                            </TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest h-10 text-muted-foreground">
                              Expiry
                            </TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest h-10 text-right text-muted-foreground">
                              Qty
                            </TableHead>
                            <TableHead className="text-[9px] uppercase tracking-widest h-10 text-right text-muted-foreground">
                              Quality
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batches.map((batch: any) => (
                            <TableRow
                              key={batch.id}
                              className="border-white/5 hover:bg-white/[0.02] transition-colors"
                            >
                              <TableCell className="py-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-xs text-white">
                                    {batch.batch_number}
                                  </span>
                                  <span className="text-[9px] text-muted-foreground uppercase tracking-tighter">
                                    {(batch as any).supplier_name || "Internal Batch"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                {batch.expiry_date ? (
                                  <div className="flex flex-col">
                                    <span className="text-xs text-white">
                                      {new Date(batch.expiry_date).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span
                                      className={cn(
                                        "text-[9px] font-bold uppercase tracking-tighter mt-0.5",
                                        (batch.days_to_expiry || 0) <= 7
                                          ? "text-rose-500 animate-pulse"
                                          : (batch.days_to_expiry || 0) <= 30
                                            ? "text-orange-500"
                                            : "text-emerald-500/60",
                                      )}
                                    >
                                      {batch.days_to_expiry && batch.days_to_expiry < 0
                                        ? "Expired"
                                        : `${batch.days_to_expiry} days remaining`}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    No Expiry
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right py-4 tabular-nums font-display text-white text-sm">
                                {batch.available_quantity}
                              </TableCell>
                              <TableCell className="text-right py-4">
                                <Badge
                                  className={cn(
                                    "text-[8px] h-5 uppercase tracking-[0.1em] px-2 border-0",
                                    batch.quality_status === "APPROVED"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : batch.quality_status === "PENDING"
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-rose-500/20 text-rose-400",
                                  )}
                                  variant="outline"
                                >
                                  {batch.quality_status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                      <Package className="size-8 mx-auto mb-3 opacity-10" />
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        No Active Batches Tracked
                      </p>
                    </div>
                  )}
                </section>

                {product.product_type === "menu_item" && (
                  <>
                    <Separator className="bg-white/5" />
                    <div className="py-4 flex flex-col items-center justify-center p-6 bg-brass/5 border border-brass/10 rounded-xl space-y-3">
                       <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                          <Utensils className="size-4 text-brass" />
                          Recipe Management
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Recipes are now managed in a dedicated dashboard.</p>
                        <Link to="/inventory/recipes" className="px-6 py-2.5 bg-brass text-navy hover:bg-brass-light transition-all rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brass/20">
                            Open Recipe Dashboard <ArrowRight className="size-3.5" />
                        </Link>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-white/5 bg-[#0A0D14]/90 backdrop-blur-xl flex gap-3">
              <button
                onClick={() => onOpenJournal(product)}
                className="flex-1 h-12 rounded-xl bg-white/[0.04] border border-white/10 text-muted-foreground font-bold uppercase tracking-widest text-[10px] hover:border-brass/30 hover:text-brass transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <BookOpen className="size-3.5" />
                Stock Journal
              </button>
              <button
                onClick={() => {
                  setEditingProduct(product);
                  setIsFormOpen(true);
                }}
                className="flex-1 h-12 rounded-xl bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light transition-all shadow-xl shadow-brass/10 flex items-center justify-center gap-2"
              >
                <ArrowRight className="size-3.5" />
                Update SKU
              </button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

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

function ProductCardImage({ src, alt, categoryType }: { src: string | null; alt: string; categoryType: string }) {
  const [error, setError] = useState(false);
  const fullUrl = getFullImageUrl(src);

  // If there's an error loading or no src is available, render the appropriate high-fidelity placeholder
  if (!fullUrl || error) {
    return (
      <div className="w-full h-full grid place-items-center text-muted-foreground/40 bg-muted/30">
        {categoryType === "restaurant" ? (
          <Utensils className="size-12 opacity-10" />
        ) : categoryType === "bar" ? (
          <Wine className="size-12 opacity-10" />
        ) : (
          <ImageIcon className="size-12 opacity-10" />
        )}
      </div>
    );
  }

  return (
    <img
      src={fullUrl}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={() => {
        console.warn(`Failed to load product image: ${fullUrl}. Falling back to default placeholder.`);
        setError(true);
      }}
    />
  );
}

function ProductsPage() {
  const [activeSection, setActiveSection] = useState<SectionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalProduct, setJournalProduct] = useState<Product | null>(null);
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false);

  const { data, isLoading } = useProducts();
  const { data: company } = useCompany();
  const exportExcel = useExportExcel();
  const syncStock = useSyncProductStock();
  const { data: profile } = useUserProfile();
  const isSuperuser = (profile as any)?.is_superuser === true;

  const sections = useMemo(() => {
    const list: { value: SectionFilter; label: string }[] = [{ value: "all", label: "All Catalog" }];
    if (!company) {
      return [
        { value: "all", label: "All Catalog" },
        { value: "general", label: "Retail Store" },
        { value: "restaurant", label: "Restaurant / Kitchen" },
        { value: "bar", label: "Bar & Drinks" },
        { value: "service", label: "Services" },
      ] as const;
    }
    if (company.enable_retail_mode || company.enable_wholesale_mode) {
      list.push({ value: "general", label: "Retail Store" });
    }
    if (company.enable_restaurant_mode) {
      list.push({ value: "restaurant", label: "Restaurant / Kitchen" });
    }
    if (company.enable_bar_mode) {
      list.push({ value: "bar", label: "Bar & Drinks" });
    }
    list.push({ value: "service", label: "Services" });
    return list;
  }, [company]);

  const openJournal = (product: Product) => {
    setJournalProduct(product);
    setIsJournalOpen(true);
    setIsDetailsOpen(false);
  };

  const products = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return data.results || [];
  }, [data]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((p: any) => {
      if (!p) return false;
      const name = (p.name || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const cat = (p.category_name || "").toLowerCase();
      const search = (searchQuery || "").toLowerCase();

      const matchesSearch = name.includes(search) || sku.includes(search) || cat.includes(search);

      // Products with null category_type default to 'general'
      const categoryType = (p.category_type as string | null) || "general";
      const matchesSection = 
        activeSection === "all" || 
        (activeSection === "service" ? p.product_type === "service" : categoryType === activeSection && p.product_type !== "service");

      return matchesSearch && matchesSection;
    });
  }, [products, searchQuery, activeSection]);

  const stats = useMemo(() => {
    const list = products || [];
    // Bar category names to detect bar items when category_type isn't set
    const BAR_CATEGORY_NAMES = ["beers", "wine", "cocktails", "spirits", "bar", "drinks", "whiskey", "whisky", "beer", "wine & cocktails"];
    return {
      total: list.length,
      value: list.reduce((acc, p) => {
        const price = Number(p.selling_price) || 0;
        const qty = Number(p.stock_quantity) || 0;
        return acc + price * qty;
      }, 0),
      restaurant: list.filter((p: any) => {
        if (p.category_type === "restaurant") return true;
        if (p.product_type === "menu_item") return true;
        return false;
      }).length,
      bar: list.filter((p: any) => {
        if (p.category_type === "bar") return true;
        const catName = (p.category_name || "").toLowerCase();
        return BAR_CATEGORY_NAMES.some(b => catName.includes(b));
      }).length,
    };
  }, [products]);

  return (
    <div className="px-6 md:px-10 py-8 max-w-[1500px] mx-auto">
      <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-brass mb-2 font-display">
            Inventory · Catalog
          </p>
          <h1 className="font-display text-3xl text-foreground tracking-tight">
            Product Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm italic font-serif">
            Maintain your product master data and pricing across all business sections
          </p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-10 px-4 rounded-md border border-brass/20 bg-card text-muted-foreground hover:text-brass transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                <FileSpreadsheet className="size-3.5" />
                Bulk Actions
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-[#0A0D14] border-white/10 text-white"
            >
              <DropdownMenuItem
                onClick={() => setIsBulkUploadOpen(true)}
                className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-brass focus:text-navy cursor-pointer"
              >
                <Upload className="size-3.5" />
                Bulk Import
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => exportExcel.mutate()}
                disabled={exportExcel.isPending}
                className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-brass focus:text-navy cursor-pointer"
              >
                {exportExcel.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Download className="size-3.5" />
                )}
                Export Catalog
              </DropdownMenuItem>
              {isSuperuser && (
                <>
                  <div className="my-1 h-px bg-white/10 mx-2" />
                  <DropdownMenuItem
                    onClick={() => {
                      syncStock.mutate(company?.id, {
                        onSuccess: (data) => toast.success(`Sync complete: ${data.updated} products updated.`),
                        onError: () => toast.error("Stock sync failed."),
                      });
                    }}
                    disabled={syncStock.isPending}
                    className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-blue-600 focus:text-white cursor-pointer"
                  >
                    {syncStock.isPending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="size-3.5" />
                    )}
                    Sync Stock Quantities
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsBranchDialogOpen(true)}
                    className="gap-2 text-[10px] uppercase tracking-widest font-bold focus:bg-blue-600 focus:text-white cursor-pointer"
                  >
                    <GitBranch className="size-3.5" />
                    Create Main Branch
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="h-10 px-5 rounded-md bg-navy text-brass-light hover:bg-navy/90 transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest border border-brass/20 shadow-lg"
          >
            <Plus className="size-3.5" />
            New SKU
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
            <Layers className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">{stats.total}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Total SKUs
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-4">
          <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Tag className="size-5" />
          </div>
          <div>
            <div className="text-xl font-display text-foreground">
              KES {stats.value.toLocaleString()}
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Catalog Value
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
              Menu Items
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
              Bar Inventory
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sections.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveSection(s.value)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                activeSection === s.value
                  ? "bg-brass text-navy border-brass shadow-lg shadow-brass/20"
                  : "bg-card text-muted-foreground border-border hover:border-brass/40",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeSection === "all" ? "entire catalog" : activeSection}...`}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-border text-sm outline-none focus:border-brass/60 focus:ring-4 focus:ring-brass/10 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="h-11 px-4 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 text-xs font-medium uppercase tracking-widest">
              <Filter className="size-3.5" />
              Advanced
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-border bg-card h-[320px]"
            />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
            <Package className="size-12 mx-auto mb-4 opacity-20 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          filteredProducts.map((product: any) => (
            <div
              key={product.id}
              onClick={() => {
                setSelectedProductId(product.id);
                setIsDetailsOpen(true);
              }}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-brass/40 hover:shadow-xl hover:shadow-brass/5 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden border-b border-border">
                <ProductCardImage
                  src={product.image_url || product.image}
                  alt={product.name}
                  categoryType={product.category_type}
                />

                <div
                  className={cn(
                    "absolute top-3 left-3 px-2 py-1 rounded text-[8px] font-display uppercase tracking-[0.15em] backdrop-blur-md border flex items-center gap-1",
                    product.product_type === "service"
                      ? "bg-blue-950/80 text-blue-400 border-blue-500/30"
                      : product.category_type === "restaurant"
                        ? "bg-orange-950/80 text-orange-400 border-orange-500/30"
                        : product.category_type === "bar"
                          ? "bg-purple-950/80 text-purple-400 border-purple-500/30"
                          : "bg-navy/80 text-brass-light border-brass/30",
                  )}
                >
                  {product.product_type === "service" && <Zap className="size-2.5" />}
                  {product.product_type === "service" ? "Service" : (product.category_type || "Retail")}
                </div>

                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="size-8 rounded-lg bg-navy text-brass-light border border-brass/20 grid place-items-center hover:bg-brass hover:text-navy transition-all shadow-xl">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-brass transition-colors">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-display">
                    SKU: {product.sku}
                  </div>
                  <span className="text-muted-foreground/20">|</span>
                  <div className="text-[10px] text-muted-foreground font-medium italic">
                    {product.category_name}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground font-medium">
                      Selling Price
                    </div>
                    <div className="text-lg font-display text-foreground tabular-nums">
                      <span className="text-[10px] text-brass mr-1">KES</span>
                      {product.selling_price.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-tighter text-muted-foreground font-medium">
                      {product.product_type === "service" ? "Availability" : product.category_type === "restaurant" ? "Available" : "In Stock"}
                    </div>
                    {product.product_type === "service" ? (
                      <div className="text-lg font-display text-blue-400 tabular-nums">
                        Unlimited
                      </div>
                    ) : (
                      <div
                        className={`text-lg font-display tabular-nums ${product.stock_quantity <= 5 ? "text-rose-500" : "text-emerald-500"}`}
                      >
                        {product.stock_quantity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ProductDetailsSheet
        productId={selectedProductId}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        setEditingProduct={setEditingProduct}
        setIsFormOpen={setIsFormOpen}
        onOpenJournal={openJournal}
      />

      <ProductFormSheet isOpen={isFormOpen} onOpenChange={setIsFormOpen} product={editingProduct} />

      <BulkUploadDialog isOpen={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen} />

      <StockJournalDialog
        productId={journalProduct?.id ?? null}
        productName={journalProduct?.name}
        productSku={journalProduct?.sku}
        isOpen={isJournalOpen}
        onOpenChange={setIsJournalOpen}
      />

      <CreateMainBranchDialog
        isOpen={isBranchDialogOpen}
        onOpenChange={setIsBranchDialogOpen}
      />
    </div>
  );
}

