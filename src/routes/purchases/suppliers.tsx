import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SupplierFormSheet } from "@/components/purchases/SupplierFormSheet";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, ExternalLink } from "lucide-react";
import { useDeleteSupplier } from "@/lib/api-hooks";
import { toast } from "sonner";
import { useConfirm } from "@/components/confirm-dialog";

export const Route = createFileRoute("/purchases/suppliers")({
  component: SuppliersDashboard,
});

function SuppliersDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  
  const confirm = useConfirm();
  const deleteSupplier = useDeleteSupplier();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", searchTerm],
    queryFn: async () => {
      const res = await api.get("/api/v1/suppliers/", {
        params: { search: searchTerm },
      });
      return res.data.results || res.data;
    },
  });

  const handleEdit = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedSupplier(null);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ title: "Delete Supplier?", body: "This action cannot be undone." })) {
      try {
        await deleteSupplier.mutateAsync(id);
        toast.success("Supplier deleted successfully");
      } catch (err) {
        toast.error("Failed to delete supplier");
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers Directory</h1>
          <p className="text-muted-foreground">
            Manage your vendors, prequalified suppliers, and lead times.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Add Supplier
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading suppliers...
                </TableCell>
              </TableRow>
            ) : suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No suppliers found.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier: any) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {supplier.name}
                      {supplier.tax_id && (
                        <Badge variant="outline" className="text-[10px]">
                          {supplier.tax_id}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {supplier.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="size-3" />
                          {supplier.email}
                        </div>
                      )}
                      {supplier.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="size-3" />
                          {supplier.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {supplier.sup_type || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {supplier.is_active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View RFQs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-600"
                          onClick={() => handleDelete(supplier.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Supplier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SupplierFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        supplier={selectedSupplier}
      />
    </div>
  );
}
