import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useRoles, useCreateRole, useUpdateRole, usePermissions, useLoadGeneralRoles, useLoadRestaurantRoles } from "@/lib/api-hooks";
import { Loader2, Plus, ShieldCheck, Search, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/settings_/roles")({
  component: RolesManagementPage,
});

function RolesManagementPage() {
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: permissions, isLoading: permsLoading } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const loadGeneral = useLoadGeneralRoles();
  const loadRestaurant = useLoadRestaurantRoles();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permission_ids: [] as number[],
  });

  const filteredRoles = roles?.filter((r: any) => 
    r.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      permission_ids: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: any) => {
    setEditingId(role.id);
    setFormData({
      name: role.name,
      description: role.description || "",
      permission_ids: role.permissions?.map((p: any) => p.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateRole.mutateAsync({ id: editingId, data: formData });
        toast.success("Role updated successfully");
      } else {
        await createRole.mutateAsync(formData);
        toast.success("Role created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save role");
    }
  };

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const handleLoadGeneral = async () => {
    try {
      await loadGeneral.mutateAsync();
      toast.success("General roles loaded successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load general roles");
    }
  };

  const handleLoadRestaurant = async () => {
    try {
      await loadRestaurant.mutateAsync();
      toast.success("Restaurant roles loaded successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load restaurant roles");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-navy flex items-center gap-3">
            <ShieldCheck className="size-8 text-brass" /> Roles & Permissions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Define access levels and system capabilities
          </p>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-bold uppercase tracking-wider text-xs border-brass text-navy hover:bg-brass/10">
                <Download className="size-4" /> Load Defaults
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLoadGeneral} disabled={loadGeneral.isPending}>
                {loadGeneral.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                General Operations
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLoadRestaurant} disabled={loadRestaurant.isPending}>
                {loadRestaurant.isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Restaurant Management
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} className="bg-brass text-navy hover:bg-brass/90 gap-2 font-bold uppercase tracking-wider text-xs">
                <Plus className="size-4" /> New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Role Name *</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Night Manager" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Description</label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center justify-between">
                  <span>System Permissions</span>
                  <span className="text-[10px] bg-muted px-2 py-1 rounded">{formData.permission_ids.length} selected</span>
                </label>
                
                {permsLoading ? <Loader2 className="size-4 animate-spin" /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-[300px] overflow-y-auto p-2 border rounded-md bg-muted/10">
                    {permissions?.map((perm: any) => (
                      <label key={perm.id} className="flex items-start gap-2 text-sm p-2 rounded border cursor-pointer hover:bg-muted/50 bg-background">
                        <input 
                          type="checkbox" 
                          className="mt-1"
                          checked={formData.permission_ids.includes(perm.id)} 
                          onChange={() => togglePermission(perm.id)} 
                        />
                        <div>
                          <div className="font-medium text-xs">{perm.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{perm.codename}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t sticky bottom-0 bg-background pb-2">
                <Button type="submit" className="w-full bg-navy text-brass-light" disabled={createRole.isPending || updateRole.isPending}>
                  {createRole.isPending || updateRole.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save Role'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Configured Roles</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search roles..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {rolesLoading ? (
            <div className="p-8 text-center"><Loader2 className="size-6 animate-spin mx-auto text-brass" /></div>
          ) : (
            <div className="divide-y">
              {filteredRoles.map((role: any) => (
                <div key={role.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                  <div>
                    <div className="font-bold flex items-center gap-2">
                      {role.name}
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-mono">
                        {role.permissions?.length || 0} permissions
                      </span>
                    </div>
                    {role.description && <div className="text-sm text-muted-foreground mt-1">{role.description}</div>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(role)}>Edit Role</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
