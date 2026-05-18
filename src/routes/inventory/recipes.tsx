import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import {
  Utensils,
  Search,
  Plus,
  Loader2,
  X,
  ArrowRight,
  Layers,
  ChefHat,
  Wine
} from "lucide-react";
import {
  useProducts,
  useRecipeForProduct,
  useCreateRecipe,
  useUpdateRecipe,
  useAddRecipeIngredient,
  useRemoveRecipeIngredient,
  Product,
} from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/inventory/recipes")({
  head: () => ({
    meta: [
      { title: "Recipe Management — Fahari Nexus" },
    ],
  }),
  component: RecipesPage,
});

function RecipesPage() {
  const { data: productsData, isLoading: loadingProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProductId, setActiveProductId] = useState<number | null>(null);

  const menuItems = useMemo(() => {
    if (!productsData) return [];
    const prods = Array.isArray(productsData) ? productsData : (productsData as any).results || [];
    return prods.filter((p: any) => p.product_type === "menu_item" || p.category_type === "restaurant" || p.category_type === "bar");
  }, [productsData]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((p: any) => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  const activeProduct = useMemo(() => {
    return menuItems.find((p: any) => p.id === activeProductId);
  }, [menuItems, activeProductId]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background">
      {/* LEFT COLUMN: Menu Items List */}
      <div className="w-[320px] shrink-0 border-r border-border bg-card flex flex-col z-10 shadow-xl">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="size-8 rounded-lg bg-brass/10 flex items-center justify-center text-brass">
              <ChefHat className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Recipe Menu</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{filteredItems.length} Items</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-border text-xs outline-none focus:border-brass/50 focus:ring-2 focus:ring-brass/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loadingProducts ? (
            <div className="p-8 text-center text-muted-foreground text-xs uppercase tracking-widest flex flex-col items-center gap-2">
              <Loader2 className="size-4 animate-spin text-brass" />
              Loading Catalog...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-[10px] uppercase tracking-widest">
              No items found
            </div>
          ) : (
            filteredItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => setActiveProductId(item.id)}
                className={cn(
                  "w-full text-left px-3 py-3 rounded-lg border transition-all group flex gap-3",
                  activeProductId === item.id 
                    ? "bg-brass/10 border-brass/30 shadow-inner" 
                    : "bg-transparent border-transparent hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "size-8 rounded-md grid place-items-center shrink-0 border",
                  item.category_type === "bar" 
                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20" 
                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                )}>
                  {item.category_type === "bar" ? <Wine className="size-4" /> : <Utensils className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={cn("text-xs font-bold truncate transition-colors", activeProductId === item.id ? "text-brass" : "text-foreground group-hover:text-brass")}>
                    {item.name}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest truncate flex items-center justify-between mt-1">
                    <span>{item.sku}</span>
                    <span className="font-mono text-emerald-500">KES {item.selling_price}</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Recipe Editor */}
      <div className="flex-1 bg-muted/10 overflow-y-auto custom-scrollbar">
        {activeProduct ? (
          <div className="max-w-4xl mx-auto p-8 animate-in fade-in zoom-in-95 duration-200">
             <div className="mb-8">
               <Badge className="bg-brass/10 text-brass hover:bg-brass/20 uppercase tracking-widest text-[10px] mb-2 font-bold">{activeProduct.category_name || activeProduct.category_type}</Badge>
               <h1 className="text-3xl font-display text-foreground">{activeProduct.name}</h1>
               <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                 <span className="font-mono uppercase tracking-widest text-[10px]">SKU: {activeProduct.sku}</span>
                 <span>•</span>
                 <span className="font-bold text-emerald-500 tabular-nums">Selling Price: KES {Number(activeProduct.selling_price).toLocaleString()}</span>
               </div>
             </div>
             <RecipeManagerSection productId={activeProduct.id} sellingPrice={activeProduct.selling_price} />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/50">
             <ChefHat className="size-24 mb-4 opacity-20" />
             <p className="text-sm font-bold uppercase tracking-widest">Select a menu item to manage its recipe</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 🍳 RECIPE MANAGER SECTION COMPONENT
// ==========================================
interface RecipeManagerSectionProps {
  productId: number;
  sellingPrice: number;
}

function RecipeManagerSection({ productId, sellingPrice }: RecipeManagerSectionProps) {
  const { data: recipe, isLoading: loadingRecipe } = useRecipeForProduct(productId);
  const { data: productsData } = useProducts();
  
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const addIngredient = useAddRecipeIngredient();
  const removeIngredient = useRemoveRecipeIngredient();

  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [instructionsText, setInstructionsText] = useState("");
  const [prepTime, setPrepTime] = useState<number>(15);

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("0.1");
  const [wastage, setWastage] = useState<string>("0");
  const [uom, setUom] = useState<string>("kg");

  useEffect(() => {
    if (recipe) {
      setInstructionsText(recipe.instructions || "");
      setPrepTime(recipe.preparation_time_minutes || 15);
    }
  }, [recipe, productId]);

  const rawMaterials = useMemo(() => {
    if (!productsData) return [];
    const prods = Array.isArray(productsData) ? productsData : (productsData as any).results || [];
    return prods.filter((p: any) => p.product_type === "raw_material" || p.category_type === "general");
  }, [productsData]);

  if (loadingRecipe) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 text-xs uppercase tracking-widest text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-brass" />
        Analyzing Recipe Book...
      </div>
    );
  }

  const handleCreateRecipe = async () => {
    try {
      await createRecipe.mutateAsync({
        menu_item: productId,
        instructions: "Standard preparation instructions.",
        preparation_time_minutes: 15,
      });
      toast.success("Recipe card created! Add your ingredients now.");
    } catch (err) {
      toast.error("Failed to create recipe card.");
    }
  };

  const handleSaveRecipeDetails = async () => {
    if (!recipe) return;
    try {
      await updateRecipe.mutateAsync({
        id: recipe.id,
        data: {
          instructions: instructionsText,
          preparation_time_minutes: Number(prepTime),
        },
      });
      setIsEditingSteps(false);
      toast.success("Recipe instructions updated!");
    } catch (err) {
      toast.error("Failed to save recipe instructions.");
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipe || !selectedIngredientId) return;
    try {
      await addIngredient.mutateAsync({
        recipe: recipe.id,
        ingredient: Number(selectedIngredientId),
        quantity: Number(quantity),
        unit_of_measure: uom,
        wastage_allowance_pct: Number(wastage),
      });
      setSelectedIngredientId("");
      setQuantity("0.1");
      setWastage("0");
      toast.success("Ingredient added to recipe!");
    } catch (err) {
      toast.error("Failed to add ingredient.");
    }
  };

  const handleRemoveIngredient = async (id: number) => {
    try {
      await removeIngredient.mutateAsync(id);
      toast.success("Ingredient removed from recipe.");
    } catch (err) {
      toast.error("Failed to remove ingredient.");
    }
  };

  if (!recipe) {
    return (
      <section className="p-12 rounded-2xl bg-card border border-border text-center space-y-4 shadow-sm">
        <Utensils className="size-16 text-muted-foreground/30 mx-auto" />
        <div>
          <h4 className="font-bold text-foreground text-lg">No Recipe Linked</h4>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            This menu item does not have a recipe card yet. Create one to enable automatic ingredient deduction and food cost analysis.
          </p>
        </div>
        <div className="pt-4">
            <Button onClick={handleCreateRecipe} className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light h-12 px-8 rounded-xl shadow-lg shadow-brass/20">
            Build Recipe Card
            </Button>
        </div>
      </section>
    );
  }

  // Cost calculations
  const baseCost = recipe.base_cost || 0;
  const foodCostPct = recipe.food_cost_percentage || 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
          <Utensils className="size-4 text-brass" />
          Bill of Materials (BOM)
        </h3>
        <Badge className={cn("text-[10px] uppercase font-bold tracking-widest px-3 py-1", 
          foodCostPct <= 30 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
          foodCostPct <= 45 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
        )} variant="outline">
          {foodCostPct.toFixed(1)}% Food Cost
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Recipe Base Cost</p>
          <p className="text-2xl font-display text-foreground tabular-nums">{new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(baseCost)}</p>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 font-bold">Prep Time</p>
          <p className="text-2xl font-display text-foreground">{prepTime} mins</p>
        </div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-brass/10 to-transparent border border-brass/20 shadow-sm flex flex-col justify-center">
          <p className="text-[10px] uppercase tracking-widest text-brass mb-2 font-bold">Expected Profit Margin</p>
          <p className="text-2xl font-display text-emerald-600 tabular-nums">{Math.max(0, 100 - foodCostPct).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold pl-1">Raw Ingredients</h4>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border">
                      <TableHead className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Ingredient</TableHead>
                      <TableHead className="text-[9px] uppercase tracking-widest font-bold text-right text-muted-foreground">Portion</TableHead>
                      <TableHead className="text-[9px] uppercase tracking-widest font-bold text-right text-muted-foreground">Wastage</TableHead>
                      <TableHead className="text-[9px] uppercase tracking-widest font-bold text-right text-muted-foreground">Cost</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipe.ingredients.map((ing) => (
                      <TableRow key={ing.id} className="border-border">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-foreground">{ing.ingredient_name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase">{ing.ingredient_sku}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-4 text-sm text-foreground font-mono">{ing.quantity} {ing.unit_of_measure}</TableCell>
                        <TableCell className="text-right py-4 text-sm text-muted-foreground font-mono">{ing.wastage_allowance_pct}%</TableCell>
                        <TableCell className="text-right py-4 text-sm text-brass font-mono font-bold">
                          {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format((ing.ingredient_cost || 0) * ing.quantity * (1 + ing.wastage_allowance_pct / 100))}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <button onClick={() => handleRemoveIngredient(ing.id)} className="size-8 inline-flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors">
                            <X className="size-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-card shadow-sm">
                <Layers className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Ingredients Configured</p>
                <p className="text-xs text-muted-foreground mt-1">Use the panel to add raw materials.</p>
              </div>
            )}

            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Preparation steps</h4>
                <button type="button" onClick={() => {
                  if (isEditingSteps) {
                    handleSaveRecipeDetails();
                  } else {
                    setIsEditingSteps(true);
                  }
                }} className="text-[10px] font-bold uppercase tracking-widest text-brass hover:text-brass/80 transition-colors bg-brass/10 px-3 py-1.5 rounded-lg">
                  {isEditingSteps ? "Save Steps" : "Edit Steps"}
                </button>
              </div>

              {isEditingSteps ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Prep time (minutes)</Label>
                    <Input type="number" value={prepTime} onChange={(e: any) => setPrepTime(Number(e.target.value))} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Instructions</Label>
                    <Textarea value={instructionsText} onChange={(e: any) => setInstructionsText(e.target.value)} className="rounded-xl min-h-[120px]" />
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                  <p className="text-sm text-foreground leading-relaxed font-serif italic">
                    "{recipe.instructions || "No preparation steps documented yet."}"
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-1">
              <form onSubmit={handleAddIngredient} className="p-6 rounded-2xl border border-brass/20 bg-brass/5 shadow-sm space-y-5 sticky top-4">
                <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-brass text-navy grid place-items-center">
                        <Plus className="size-4" />
                    </div>
                    <h4 className="text-xs uppercase tracking-widest text-foreground font-bold">Add Raw Material</h4>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Select Ingredient</Label>
                    <select value={selectedIngredientId} onChange={(e: any) => setSelectedIngredientId(e.target.value)} className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm text-foreground outline-none focus:border-brass focus:ring-1 focus:ring-brass">
                      <option value="">-- Choose Ingredient --</option>
                      {rawMaterials.map((mat: any) => (
                        <option key={mat.id} value={mat.id.toString()}>
                          {mat.name} ({mat.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Qty</Label>
                        <Input type="number" step="any" value={quantity} onChange={(e: any) => setQuantity(e.target.value)} className="h-11 rounded-xl bg-background" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Unit</Label>
                        <select value={uom} onChange={(e: any) => setUom(e.target.value)} className="w-full bg-background border border-border rounded-xl h-11 px-3 text-sm text-foreground outline-none focus:border-brass">
                          <option value="kg">Kg</option>
                          <option value="l">L</option>
                          <option value="g">g</option>
                          <option value="ml">ml</option>
                          <option value="pcs">pcs</option>
                        </select>
                      </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Wastage %</Label>
                    <Input type="number" step="any" value={wastage} onChange={(e: any) => setWastage(e.target.value)} className="h-11 rounded-xl bg-background" />
                    <p className="text-[10px] text-muted-foreground">Expected trim/loss during prep</p>
                  </div>
                </div>
                <Button type="submit" disabled={!selectedIngredientId} className="w-full bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light h-12 rounded-xl mt-4">
                  Add Ingredient
                </Button>
              </form>
          </div>
      </div>
    </section>
  );
}
