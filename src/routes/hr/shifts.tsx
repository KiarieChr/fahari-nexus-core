import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useShifts, useCreateShift, useShiftAssignments, useCreateShiftAssignment, useUsers } from "@/lib/api-hooks";
import { Loader2, CalendarClock, Plus, Calendar as CalendarIcon, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/hr/shifts")({
  component: ShiftsManagementPage,
});

function ShiftsManagementPage() {
  const { data: shifts, isLoading: loadingShifts } = useShifts();
  const { data: users, isLoading: loadingUsers } = useUsers();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: assignments, isLoading: loadingAssignments } = useShiftAssignments({ date: selectedDate });
  
  const createShift = useCreateShift();
  const createAssignment = useCreateShiftAssignment();
  
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [shiftForm, setShiftForm] = useState({
    name: "",
    start_time: "08:00:00",
    end_time: "17:00:00",
    color_code: "#3b82f6",
  });

  const [assignForm, setAssignForm] = useState({
    employee: "",
    shift: "",
    date: selectedDate,
    notes: "",
  });

  // Filter users who are linked to HR (have Employee profile)
  const employees = users?.filter((u: any) => u.is_employee) || [];

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShift.mutateAsync(shiftForm);
      toast.success("Shift created successfully");
      setIsShiftModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create shift");
    }
  };

  const handleAssignShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment.mutateAsync(assignForm);
      toast.success("Employee assigned to shift successfully");
      setIsAssignModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.non_field_errors?.[0] || "Failed to assign shift");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-navy flex items-center gap-3">
            <CalendarClock className="size-8 text-brass" /> Shifts & Rota
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage work shifts and employee rosters
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 font-bold uppercase tracking-wider text-xs border-brass text-navy hover:bg-brass/10">
                <Plus className="size-4" /> New Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Define Work Shift</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateShift} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Shift Name *</label>
                  <Input required value={shiftForm.name} onChange={e => setShiftForm({...shiftForm, name: e.target.value})} placeholder="e.g. Morning Shift" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Start Time *</label>
                    <Input type="time" required value={shiftForm.start_time} onChange={e => setShiftForm({...shiftForm, start_time: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">End Time *</label>
                    <Input type="time" required value={shiftForm.end_time} onChange={e => setShiftForm({...shiftForm, end_time: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Color Code</label>
                  <Input type="color" className="h-12 px-2" value={shiftForm.color_code} onChange={e => setShiftForm({...shiftForm, color_code: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-navy text-brass-light" disabled={createShift.isPending}>
                  {createShift.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Create Shift'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brass text-navy hover:bg-brass/90 gap-2 font-bold uppercase tracking-wider text-xs">
                <UserCheck className="size-4" /> Assign Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Shift to Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAssignShift} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Employee *</label>
                  <select 
                    required 
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    value={assignForm.employee} 
                    onChange={e => setAssignForm({...assignForm, employee: e.target.value})}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} (@{emp.username})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Shift *</label>
                  <select 
                    required 
                    className="w-full h-10 px-3 rounded-md border bg-background text-sm"
                    value={assignForm.shift} 
                    onChange={e => setAssignForm({...assignForm, shift: e.target.value})}
                  >
                    <option value="">Select Shift</option>
                    {shifts?.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Date *</label>
                  <Input type="date" required value={assignForm.date} onChange={e => setAssignForm({...assignForm, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Notes</label>
                  <Input value={assignForm.notes} onChange={e => setAssignForm({...assignForm, notes: e.target.value})} />
                </div>
                <Button type="submit" className="w-full bg-navy text-brass-light" disabled={createAssignment.isPending}>
                  {createAssignment.isPending ? <Loader2 className="size-4 animate-spin" /> : 'Assign Shift'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-t-4 border-t-navy">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <CardTitle className="text-lg">Available Shifts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingShifts ? (
              <div className="p-8 text-center"><Loader2 className="size-6 animate-spin mx-auto text-brass" /></div>
            ) : shifts?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic text-sm">No shifts configured yet.</div>
            ) : (
              <div className="divide-y">
                {shifts?.map((shift: any) => (
                  <div key={shift.id} className="p-4 flex items-center gap-3 hover:bg-muted/10">
                    <div className="size-4 rounded-full" style={{ backgroundColor: shift.color_code }}></div>
                    <div>
                      <div className="font-bold text-sm">{shift.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{shift.start_time} - {shift.end_time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-t-4 border-t-brass">
          <CardHeader className="bg-muted/30 border-b pb-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Daily Roster</CardTitle>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-4 text-muted-foreground" />
              <Input 
                type="date" 
                className="h-8 w-40 text-sm"
                value={selectedDate}
                onChange={e => {
                  setSelectedDate(e.target.value);
                  setAssignForm({...assignForm, date: e.target.value});
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingAssignments ? (
              <div className="p-8 text-center"><Loader2 className="size-6 animate-spin mx-auto text-brass" /></div>
            ) : assignments?.length === 0 ? (
              <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                <CalendarClock className="size-10 text-muted-foreground/30" />
                <p>No staff assigned for {selectedDate}</p>
              </div>
            ) : (
              <div className="divide-y">
                {assignments?.map((assignment: any) => (
                  <div key={assignment.id} className="p-4 flex items-center justify-between hover:bg-muted/10">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: assignment.shift_details?.color_code }}></div>
                      <div>
                        <div className="font-bold text-sm">{assignment.employee_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{assignment.shift_details?.name}</span>
                          <span>{assignment.shift_details?.start_time} - {assignment.shift_details?.end_time}</span>
                        </div>
                      </div>
                    </div>
                    {assignment.notes && (
                      <div className="text-xs italic text-muted-foreground bg-muted/30 p-2 rounded max-w-[200px] truncate">
                        {assignment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
