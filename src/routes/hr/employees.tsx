import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/lib/api-hooks";
import { 
  Users, UserPlus, Search, Edit3, Trash2, Mail, Phone, Calendar, 
  MapPin, Shield, CheckCircle, XCircle, Plus, X, Loader2
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/employees")({
  component: EmployeeDirectory,
});

function EmployeeDirectory() {
  const { data: employeesResponse, isLoading, refetch } = useEmployees();
  const employees = employeesResponse?.results || (Array.isArray(employeesResponse) ? employeesResponse : []);

  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Form states
  const [fathersName, setFathersName] = useState("");
  const [mothersName, setMothersName] = useState("");
  const [homeDistrict, setHomeDistrict] = useState("");
  const [spouseOccupation, setSpouseOccupation] = useState("");
  const [spouseDistrict, setSpouseDistrict] = useState("");
  const [religion, setReligion] = useState("");
  const [dateJoining, setDateJoining] = useState("");
  const [entryDesignation, setEntryDesignation] = useState("");
  const [status, setStatus] = useState("active");

  const openAddModal = () => {
    setEditingEmployee(null);
    setFathersName("");
    setMothersName("");
    setHomeDistrict("");
    setSpouseOccupation("");
    setSpouseDistrict("");
    setReligion("");
    setDateJoining(new Date().toISOString().split("T")[0]);
    setEntryDesignation("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setFathersName(emp.fathers_name || "");
    setMothersName(emp.mothers_name || "");
    setHomeDistrict(emp.home_district || "");
    setSpouseOccupation(emp.spouse_occupation || "");
    setSpouseDistrict(emp.spouse_district || "");
    setReligion(emp.religion || "");
    setDateJoining(emp.date_joining || "");
    setEntryDesignation(emp.entry_designation || "");
    setStatus(emp.status || "active");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      fathers_name: fathersName,
      mothers_name: mothersName,
      home_district: homeDistrict,
      spouse_occupation: spouseOccupation,
      spouse_district: spouseDistrict,
      religion,
      date_joining: dateJoining || null,
      entry_designation: entryDesignation,
      status,
    };

    try {
      if (editingEmployee) {
        await updateEmployeeMutation.mutateAsync({ id: editingEmployee.id, data: payload });
        toast.success("Employee record updated successfully");
      } else {
        await createEmployeeMutation.mutateAsync(payload);
        toast.success("Employee profile added successfully");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save employee profile");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      toast.success("Employee removed successfully");
      refetch();
    } catch (err: any) {
      toast.error("Failed to delete employee");
    }
  };

  const filteredEmployees = employees.filter((emp: any) => {
    const fullName = emp.full_name || emp.username || "";
    const designation = emp.entry_designation || "";
    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      designation.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="min-h-full bg-background p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-3">
              <Users className="text-brass size-8" />
              Employee Directory
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Fahari Nexus Workspace: Staff profiles, shifts, and compliance
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-brass hover:bg-brass-light text-navy-deep font-bold uppercase tracking-wider text-xs rounded transition-all shadow-md shadow-brass/10"
          >
            <UserPlus className="size-4" /> Add Employee
          </button>
        </div>

        {/* Search / Filter Row */}
        <div className="flex items-center bg-card border border-border rounded px-4 py-3 max-w-md shadow-sm">
          <Search className="text-muted-foreground size-5 mr-3" />
          <input
            type="text"
            placeholder="Search by name, designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-foreground text-sm font-mono placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Grid Display */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground font-mono">
            <Loader2 className="animate-spin size-8 text-brass" />
            Loading staff records...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Users className="size-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-serif text-foreground mb-1">No employees found</h3>
            <p className="text-muted-foreground text-sm font-mono max-w-sm mx-auto">
              Try adjusting your search criteria or add a new employee profile to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((emp: any) => (
              <div 
                key={emp.id} 
                className="bg-card border border-border rounded-lg p-6 hover:border-brass/35 transition-all shadow-sm flex flex-col justify-between group relative"
              >
                {/* User Info Header */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-lg text-foreground group-hover:text-brass transition-colors">
                        {emp.full_name || emp.username || "Staff Member"}
                      </h3>
                      <p className="text-brass-light font-mono text-xs font-semibold uppercase tracking-wider mt-0.5">
                        {emp.entry_designation || "No Designation"}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                      emp.status === "active" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    }`}>
                      {emp.status}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="space-y-2 border-t border-border/50 pt-4 font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-2.5">
                      <Mail className="size-3.5 text-muted-foreground/80" />
                      <span>{emp.email_address || "No Email"}</span>
                    </div>
                    {emp.date_joining && (
                      <div className="flex items-center gap-2.5">
                        <Calendar className="size-3.5 text-muted-foreground/80" />
                        <span>Joined: {new Date(emp.date_joining).toLocaleDateString("en-GB")}</span>
                      </div>
                    )}
                    {emp.home_district && (
                      <div className="flex items-center gap-2.5">
                        <MapPin className="size-3.5 text-muted-foreground/80" />
                        <span>District: {emp.home_district}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/40">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 rounded hover:bg-muted text-brass transition-colors"
                    title="Edit Record"
                  >
                    <Edit3 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500 transition-colors"
                    title="Remove Employee"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 bg-navy border-b border-border">
                <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
                  <Users className="text-brass size-5" />
                  {editingEmployee ? "Edit Employee Profile" : "Add New Employee"}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Job specifications */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Entry Designation</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sales Executive, Cashier"
                      value={entryDesignation}
                      onChange={(e) => setEntryDesignation(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Joining</label>
                    <input
                      type="date"
                      value={dateJoining}
                      onChange={(e) => setDateJoining(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  {/* Personal */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Father's Name</label>
                    <input
                      type="text"
                      placeholder="Father's full name"
                      value={fathersName}
                      onChange={(e) => setFathersName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mother's Name</label>
                    <input
                      type="text"
                      placeholder="Mother's full name"
                      value={mothersName}
                      onChange={(e) => setMothersName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Home District / Area</label>
                    <input
                      type="text"
                      placeholder="Home District"
                      value={homeDistrict}
                      onChange={(e) => setHomeDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Religion</label>
                    <input
                      type="text"
                      placeholder="e.g. Christian, Islam"
                      value={religion}
                      onChange={(e) => setReligion(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  {/* Spouse details */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spouse Occupation</label>
                    <input
                      type="text"
                      placeholder="Spouse's Job/Occupation"
                      value={spouseOccupation}
                      onChange={(e) => setSpouseOccupation(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spouse District</label>
                    <input
                      type="text"
                      placeholder="Spouse's District"
                      value={spouseDistrict}
                      onChange={(e) => setSpouseDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded border border-border text-foreground hover:bg-muted font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-brass hover:bg-brass-light text-navy-deep font-bold uppercase tracking-wider text-xs rounded transition-colors disabled:opacity-50"
                  >
                    {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) && (
                      <Loader2 className="animate-spin size-4" />
                    )}
                    Save Record
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
