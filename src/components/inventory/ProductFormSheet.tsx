import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useCreateProduct,
  useUpdateProduct,
  useCategories,
  useBrands,
  useSuppliers,
  Product,
} from "@/lib/api-hooks";
import { Loader2, Upload, X, Package, Save, Plus, Zap, Utensils, Layers } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { CategoryFormSheet } from "./CategoryFormSheet";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  sku: z.string().min(2, "SKU is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  supplier: z.string().optional(),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  markup_percentage: z.coerce.number().default(0),
  tax_rate: z.coerce.number().min(0),
  is_taxable: z.boolean(),
  stock_quantity: z.coerce.number().min(0),
  min_stock_level: z.coerce.number().min(0),
  max_stock_level: z.coerce.number().optional(),
  reorder_point: z.coerce.number().optional(),
  requires_batch_tracking: z.boolean(),
  requires_expiry_tracking: z.boolean(),
  is_active: z.boolean(),
  product_type: z.enum(["product", "service", "menu_item", "raw_material"]).default("product"),
});

type ProductFormValues = z.infer<typeof productSchema>;

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

interface ProductFormSheetProps {
  product?: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductFormSheet({ product, isOpen, onOpenChange }: ProductFormSheetProps) {
  const isEdit = !!product;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: suppliersData } = useSuppliers();
  const suppliers = Array.isArray(suppliersData) ? suppliersData : (suppliersData?.results || []);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      category: "",
      brand: "",
      supplier: "",
      cost_price: 0,
      selling_price: 0,
      markup_percentage: 0,
      tax_rate: 16,
      is_taxable: true,
      stock_quantity: 0,
      min_stock_level: 5,
      max_stock_level: 100,
      reorder_point: 10,
      requires_batch_tracking: false,
      requires_expiry_tracking: false,
      is_active: true,
      product_type: "product",
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      form.reset({
        name: product.name,
        sku: product.sku,
        description: (product as any).description || "",
        category: (product as any).category?.toString() || "",
        brand: (product as any).brand?.toString() || "",
        supplier: (product as any).supplier?.toString() || "",
        cost_price: product.cost_price,
        selling_price: product.selling_price,
        markup_percentage: product.markup_percentage,
        tax_rate: (product as any).tax_rate || 16,
        is_taxable: (product as any).is_taxable ?? true,
        stock_quantity: product.stock_quantity,
        min_stock_level: (product as any).min_stock_level || 5,
        max_stock_level: (product as any).max_stock_level || 100,
        reorder_point: (product as any).reorder_point || 10,
        requires_batch_tracking: (product as any).requires_batch_tracking || false,
        requires_expiry_tracking: (product as any).requires_expiry_tracking || false,
        is_active: (product as any).is_active ?? true,
        product_type: product.product_type || "product",
      });
      setImagePreview(getFullImageUrl(product.image_url || product.image) || null);
    } else if (isOpen) {
      form.reset({
        name: "",
        sku: "",
        description: "",
        category: "",
        brand: "",
        supplier: "",
        cost_price: 0,
        selling_price: 0,
        markup_percentage: 0,
        tax_rate: 16,
        is_taxable: true,
        stock_quantity: 0,
        min_stock_level: 5,
        max_stock_level: 100,
        reorder_point: 10,
        requires_batch_tracking: false,
        requires_expiry_tracking: false,
        is_active: true,
        product_type: "product",
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [product, form, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    try {
      const payload: any = { ...values };
      if (imageFile) {
        payload.image = imageFile;
      }

      if (isEdit && product) {
        await updateProduct.mutateAsync({ id: product.id, data: payload });
        toast.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "An error occurred during submission");
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-2xl border-l border-brass/20 bg-[#0A0D14] text-white p-0 overflow-hidden flex flex-col">
          <SheetHeader className="px-6 py-6 border-b border-white/5 bg-white/[0.02]">
            <SheetTitle className="text-xl font-display text-white">
              {isEdit ? "Edit Product" : "New Product SKU"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-xs uppercase tracking-widest">
              {isEdit ? `Modifying ${product.name}` : "Add a new item to your inventory catalog"}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-8 pb-10">
                {/* Image Upload Area */}
                <div className="space-y-4">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                    Product Imagery
                  </Label>
                  <div className="flex gap-6 items-center">
                    <div className="size-32 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] overflow-hidden relative group shrink-0">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                            }}
                            className="absolute top-2 right-2 size-6 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center"
                          >
                            <X className="size-3" />
                          </button>
                        </>
                      ) : (
                        <label className="size-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-all">
                          <Upload className="size-6 text-muted-foreground mb-2" />
                          <span className="text-[8px] uppercase font-bold tracking-widest text-muted-foreground">
                            Upload Image
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-white">High-Res Product Image</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Recommended size: 800x800px.
                        <br />
                        Accepted formats: JPG, PNG, WEBP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="product_type"
                      render={({ field }) => (
                        <FormItem className="col-span-full mb-2">
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Item Type
                          </FormLabel>
                          <div className="grid grid-cols-2 gap-3">
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${field.value === 'product' ? 'bg-brass/10 border-brass text-brass' : 'bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.05]'}`}>
                              <input type="radio" className="hidden" checked={field.value === 'product'} onChange={() => field.onChange('product')} />
                              <Package className="size-4" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Physical SKU</span>
                            </label>
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${field.value === 'service' ? 'bg-brass/10 border-brass text-brass' : 'bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.05]'}`}>
                              <input type="radio" className="hidden" checked={field.value === 'service'} onChange={() => field.onChange('service')} />
                              <Zap className="size-4" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Service</span>
                            </label>
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${field.value === 'menu_item' ? 'bg-brass/10 border-brass text-brass' : 'bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.05]'}`}>
                              <input type="radio" className="hidden" checked={field.value === 'menu_item'} onChange={() => field.onChange('menu_item')} />
                              <Utensils className="size-4" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Prepared Food</span>
                            </label>
                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${field.value === 'raw_material' ? 'bg-brass/10 border-brass text-brass' : 'bg-white/[0.02] border-white/10 text-muted-foreground hover:bg-white/[0.05]'}`}>
                              <input type="radio" className="hidden" checked={field.value === 'raw_material'} onChange={() => field.onChange('raw_material')} />
                              <Layers className="size-4" />
                              <span className="text-[9px] font-bold uppercase tracking-widest">Ingredient</span>
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Product Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Premium White Truffle Oil"
                              className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 transition-all text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            SKU / Barcode
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SKU-8829-10"
                              className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 transition-all font-mono text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                              Category
                            </FormLabel>
                            <button
                              type="button"
                              onClick={() => setIsCategorySheetOpen(true)}
                              className="text-[10px] text-brass hover:text-brass-light transition-colors font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <Plus className="size-2.5" />
                              New
                            </button>
                          </div>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 text-white">
                                <SelectValue placeholder="Select classification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                              {categories?.results?.map((cat: any) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.name} ({cat.category_type})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Brand
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 text-white">
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                              {brands?.results?.map((brand: any) => (
                                <SelectItem key={brand.id} value={brand.id.toString()}>
                                  {brand.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Primary Supplier
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 text-white">
                                <SelectValue placeholder="Select supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                              {suppliers?.map((sup: any) => (
                                <SelectItem key={sup.id} value={sup.id.toString()}>
                                  {sup.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          Technical Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product specifications, notes, or usage instructions..."
                            className="bg-white/[0.03] border-white/10 min-h-[100px] focus:border-brass/50 text-white"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing Intelligence */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brass flex items-center gap-2">
                    <Package className="size-3.5" />
                    Pricing & Financials
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="cost_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Unit Cost (KES)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-white/[0.03] border-white/10 h-11 text-white"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="selling_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Selling Price (KES)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              className="bg-white/[0.03] border-white/10 h-11 text-white"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tax_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                            Tax Rate (%)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-white/[0.03] border-white/10 h-11 text-white"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Stock Controls (Hidden for Services) */}
                {form.watch("product_type") === "product" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Inventory Thresholds
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="min_stock_level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[8px] uppercase tracking-widest text-muted-foreground">
                              Min Stock
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-white/[0.03] border-white/10 h-9 text-white"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="reorder_point"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[8px] uppercase tracking-widest text-muted-foreground">
                              Reorder Pt
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="bg-white/[0.03] border-white/10 h-9 text-white"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Operational Toggles
                    </h4>
                    <div className="space-y-4 pt-2">
                      <FormField
                        control={form.control}
                        name="requires_batch_tracking"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[10px] uppercase tracking-widest text-white">
                                Batch Tracking
                              </FormLabel>
                              <FormDescription className="text-[8px]">
                                Mandatory lot numbering
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="requires_expiry_tracking"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[10px] uppercase tracking-widest text-white">
                                Expiry Monitoring
                              </FormLabel>
                              <FormDescription className="text-[8px]">
                                Track shelf life
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.01] p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-[10px] uppercase tracking-widest text-white">
                                Active Status
                              </FormLabel>
                              <FormDescription className="text-[8px]">
                                Available for sales
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

            <SheetFooter className="p-6 border-t border-white/5 bg-[#0A0D14]/90 backdrop-blur-xl flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-xl bg-white/[0.05] text-white hover:bg-white/10 border-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createProduct.isPending || updateProduct.isPending}
                className="flex-1 h-12 rounded-xl bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light transition-all shadow-xl shadow-brass/10 gap-2"
              >
                {createProduct.isPending || updateProduct.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isEdit ? "Update Product" : "Commit New SKU"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
    <CategoryFormSheet isOpen={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen} />
    </>
  );
}
