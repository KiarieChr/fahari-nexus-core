import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers, useCreateUser, useUpdateUser, useRoles } from "@/lib/api-hooks";
import { Loader2, Plus, Users, Search, Shield, Building, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/settings_/users")({
  component: UsersManagementPage,
});

function UsersManagementPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    link_to_hr: false,
    role_ids: [] as number[],
  });

  const filteredUsers = users?.filter((u: any) => 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      link_to_hr: false,
      role_ids: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingId(user.id);
    setFormData({
      username: user.username,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "", // Leave blank unless changing
      link_to_hr: user.is_employee || false,
      role_ids: user.company_roles?.map((r: any) => r.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.password) delete payload.password; // don't send empty pass
      
      if (editingId) {
        await updateUser.mutateAsync({ id: editingId, data: payload });
        toast.success("User updated successfully");
      } else {
        await createUser.mutateAsync(payload);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save user");
    }
  };

  const toggleRole = (roleId: number) => {
    setFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId]
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-navy flex items-center gap-3">
            <Users className="size-8 text-brass" /> User Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage system access, roles, and HR employee links
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="bg-brass text-navy hover:bg-brass/90 gap-2 font-bold uppercase tracking-wider text-xs">
              <Plus className="size-4" /> New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit User' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">First Name</label>
                  <Input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                  <Input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Username *</label>
                <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Email</label>
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Password {editingId && '(Leave blank to keep)'}</label>
                <Input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <label className="text-xs font-bold uppercase text-muted-foreground">Assign Roles</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles?.map((role: any) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm p-2 rounded border cursor-pointer hover:bg-muted/50">
                      <input 
                        type="checkbox" 
                        checked={formData.role_ids.includes(role.id)} 
                        onChange={() => toggleRole(role.id)} 
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>

              {!editingId && (
                <div className="space-y-2 pt-2 border-t">
                  <label className="flex items-center gap-2 p-3 rounded-lg border bg-muted/20 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="size-4"
                      checked={formData.link_to_hr} 
                      onChange={e => setFormData({...formData, link_to_hr: e.target.checked})} 
                    />
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <Building className="size-4 text-brass" /> Link to HR Employee
                      </div>
                      <div className="text-xs text-muted-foreground">Creates an employee profile for shift assignment</div>
                    </div>
                  </label>
                </div>
              )}

              <Button type="submit" className="w-full bg-navy text-brass-light" disabled={createUser.isPending || updateUser.isPending}>
                {createUser.isPending || updateUser.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Save User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 bg-background"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="size-6 animate-spin mx-auto text-brass" /></div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user: any) => (
                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-full bg-navy text-brass-light flex items-center justify-center font-bold text-lg">
                      {user.first_name?.[0] || user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{user.first_name} {user.last_name} <span className="text-muted-foreground font-normal">(@{user.username})</span></div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Shield className="size-3 text-brass" /> 
                        {user.company_roles?.map((r: any) => r.name).join(", ") || "No Roles"}
                        {user.is_employee && (
                          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full ml-2">
                            <UserCheck className="size-3" /> HR Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleOpenEdit(user)}>Edit Profile</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
