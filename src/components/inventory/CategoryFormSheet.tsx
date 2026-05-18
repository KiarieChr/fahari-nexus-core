import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCreateCategory, useUpdateCategory, useDeleteCategory, useCompany } from "@/lib/api-hooks";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(2, "Category name is required"),
  description: z.string().optional(),
  category_type: z.enum(["general", "restaurant", "bar"]),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: any;
}

export function CategoryFormSheet({ isOpen, onOpenChange, category }: CategoryFormSheetProps) {
  const { data: company } = useCompany();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const isRestaurantOrBar = company?.enable_restaurant_mode || company?.enable_bar_mode;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: "",
      description: "",
      category_type: "general",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
          name: category.name || "",
          description: category.description || "",
          category_type: category.category_type || "general",
        });
      } else {
        form.reset({
          name: "",
          description: "",
          category_type: "general",
        });
      }
    }
  }, [isOpen, category, form]);

  const onSubmit: SubmitHandler<CategoryFormValues> = async (values) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, data: values });
        toast.success("Category updated successfully");
      } else {
        await createCategory.mutateAsync(values);
        toast.success("Category created successfully");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred during submission");
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete category "${category.name}"?`);
    if (!confirmDelete) return;

    try {
      await deleteCategory.mutateAsync(category.id);
      toast.success("Category deleted successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md border-l border-brass/20 bg-[#0A0D14] text-white p-0 overflow-hidden flex flex-col">
        <SheetHeader className="px-6 py-6 border-b border-white/5 bg-white/[0.02]">
          <SheetTitle className="text-xl font-display text-white">
            {category ? "Edit Product Category" : "New Product Category"}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground text-xs uppercase tracking-widest">
            {category ? `Modify details for category "${category.name}"` : "Create a new classification for your inventory"}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-6 pb-10">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Category Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Beverages, Main Course, Electronics"
                          className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 transition-all text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {isRestaurantOrBar ? (
                  <FormField
                    control={form.control}
                    name="category_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                          Category Type / Mode
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/[0.03] border-white/10 h-11 focus:border-brass/50 text-white">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#0A0D14] border-white/10 text-white">
                            {company?.enable_retail_mode && (
                              <SelectItem value="general">General Retail</SelectItem>
                            )}
                            {company?.enable_restaurant_mode && (
                              <SelectItem value="restaurant">Restaurant / Kitchen</SelectItem>
                            )}
                            {company?.enable_bar_mode && (
                              <SelectItem value="bar">Bar / Drinks</SelectItem>
                            )}
                            {!company?.enable_retail_mode && !company?.enable_restaurant_mode && !company?.enable_bar_mode && (
                              <SelectItem value="general">General Retail</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-[8px] text-muted-foreground">
                          Specifies the business mode (Retail Store, Restaurant, or Bar) where this category is active.
                        </FormDescription>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                ) : (
                  <input type="hidden" {...form.register("category_type")} value="general" />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe this category..."
                          className="bg-white/[0.03] border-white/10 min-h-[100px] focus:border-brass/50 text-white"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </ScrollArea>

            <SheetFooter className="p-6 border-t border-white/5 bg-[#0A0D14]/90 backdrop-blur-xl flex flex-col sm:flex-row gap-3">
              {category && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteCategory.isPending}
                  className="sm:flex-none w-full sm:w-auto h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-all text-[10px] font-bold uppercase tracking-widest gap-2"
                >
                  {deleteCategory.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Delete
                </Button>
              )}
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
                disabled={isPending}
                className="flex-1 h-12 rounded-xl bg-brass text-navy font-bold uppercase tracking-widest text-[10px] hover:bg-brass-light transition-all shadow-xl shadow-brass/10 gap-2"
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Category
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
