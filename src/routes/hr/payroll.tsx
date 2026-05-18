import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { 
  usePayrollPeriods, useCreatePayrollPeriod, useCalculatePayroll, usePayslips,
  usePayComponents, useCreatePayComponent, useDeletePayComponent,
  useEmployeePayComponents, useCreateEmployeePayComponent, useEmployees
} from "@/lib/api-hooks";
import { 
  Coins, Calendar, Play, FileText, Settings, Sparkles, Plus, 
  Trash2, PlusCircle, CheckCircle, ShieldAlert, Award, User, DollarSign,
  TrendingUp, Download, Eye, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/hr/payroll")({
  component: PayrollDashboard,
});

function PayrollDashboard() {
  const [activeTab, setActiveTab] = useState<"periods" | "payslips" | "components" | "structures">("periods");

  // Backend queries
  const { data: periods, isLoading: isPeriodsLoading, refetch: refetchPeriods } = usePayrollPeriods();
  const { data: payslips, isLoading: isPayslipsLoading, refetch: refetchPayslips } = usePayslips();
  const { data: components, refetch: refetchComponents } = usePayComponents();
  const { data: employeeStructures, refetch: refetchStructures } = useEmployeePayComponents();
  const { data: employees } = useEmployees();

  // Mutations
  const createPeriodMutation = useCreatePayrollPeriod();
  const calculatePayrollMutation = useCalculatePayroll();
  const createComponentMutation = useCreatePayComponent();
  const deleteComponentMutation = useDeletePayComponent();
  const createStructureMutation = useCreateEmployeePayComponent();

  // Modals & form states
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [compName, setCompName] = useState("");
  const [compType, setCompType] = useState("EARNING");
  const [compCalc, setCompCalc] = useState("FIXED");
  const [compDefaultVal, setCompDefaultVal] = useState("");
  const [compTaxable, setCompTaxable] = useState(true);
  const [compMandatory, setCompMandatory] = useState(false);

  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [selectedComp, setSelectedComp] = useState("");
  const [customVal, setCustomVal] = useState("");

  const [viewingPayslip, setViewingPayslip] = useState<any>(null);

  // Form Submissions
  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPeriodMutation.mutateAsync({
        name: periodName,
        start_date: startDate,
        end_date: endDate,
      });
      toast.success("Payroll month cycle created!");
      setIsPeriodModalOpen(false);
      refetchPeriods();
    } catch (err: any) {
      toast.error("Failed to create payroll period");
    }
  };

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createComponentMutation.mutateAsync({
        name: compName,
        component_type: compType,
        calculation_type: compCalc,
        default_value: parseFloat(compDefaultVal) || 0.00,
        is_taxable: compTaxable,
        is_mandatory: compMandatory,
      });
      toast.success("Payroll Account/Component registered!");
      setIsComponentModalOpen(false);
      refetchComponents();
    } catch (err: any) {
      toast.error("Failed to create component");
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createStructureMutation.mutateAsync({
        employee: parseInt(selectedEmp),
        component: parseInt(selectedComp),
        custom_value: customVal ? parseFloat(customVal) : null,
      });
      toast.success("Assigned salary element to employee profile!");
      setIsStructureModalOpen(false);
      refetchStructures();
    } catch (err: any) {
      toast.error("Failed to map salary component");
    }
  };

  const handleCalculate = async (id: number) => {
    const loader = toast.loading("Processing dynamic calculations for all active staff...");
    try {
      const res = await calculatePayrollMutation.mutateAsync(id);
      toast.success(res?.message || "Payroll computed successfully!", { id: loader });
      refetchPeriods();
      refetchPayslips();
    } catch (err: any) {
      toast.error("Payroll calculation failed", { id: loader });
    }
  };

  const handleDeleteComponent = async (id: number) => {
    if (!confirm("Remove this pay component?")) return;
    try {
      await deleteComponentMutation.mutateAsync(id);
      toast.success("Pay component deleted");
      refetchComponents();
    } catch (err: any) {
      toast.error("Failed to delete component");
    }
  };

  return (
    <div className="min-h-full bg-background p-4 md:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-5">
          <div>
            <h1 className="font-serif text-3xl text-foreground flex items-center gap-3">
              <Coins className="text-brass size-8" />
              Dynamic Payroll Workspace
            </h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Automated payroll engine featuring progressive taxation, NSSF, Housing Levy, and SHIF calculations
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {activeTab === "periods" && (
              <button
                onClick={() => setIsPeriodModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brass hover:bg-brass-light text-navy-deep font-bold uppercase tracking-wider text-xs rounded transition-all shadow-md shadow-brass/10"
              >
                <Calendar className="size-4" /> Open New Month Cycle
              </button>
            )}
            {activeTab === "components" && (
              <button
                onClick={() => setIsComponentModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brass hover:bg-brass-light text-navy-deep font-bold uppercase tracking-wider text-xs rounded transition-all shadow-md shadow-brass/10"
              >
                <Plus className="size-4" /> Create Pay Account
              </button>
            )}
            {activeTab === "structures" && (
              <button
                onClick={() => setIsStructureModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brass hover:bg-brass-light text-navy-deep font-bold uppercase tracking-wider text-xs rounded transition-all shadow-md shadow-brass/10"
              >
                <PlusCircle className="size-4" /> Map Employee Salary
              </button>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-border gap-2 overflow-x-auto pb-px">
          {[
            { id: "periods", label: "Month Cycles", icon: Calendar },
            { id: "payslips", label: "Payslip Archives", icon: FileText },
            { id: "components", label: "Salary/Tax Components", icon: Coins },
            { id: "structures", label: "Employee Salary Mapping", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-serif text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brass text-brass bg-card/30"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        
        {/* Tab 1: Month Cycles / Payroll periods */}
        {activeTab === "periods" && (
          <div className="space-y-4">
            {isPeriodsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brass size-8" /></div>
            ) : !periods || periods.length === 0 ? (
              <div className="bg-card border border-border p-12 text-center rounded-lg">
                <Calendar className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-foreground mb-1">No active cycles found</h3>
                <p className="text-muted-foreground text-sm font-mono max-w-sm mx-auto mb-4">
                  Open a new month cycle (e.g. May 2026) to run the calculation engine.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {periods.map((p: any) => (
                  <div key={p.id} className="bg-card border border-border rounded-lg p-6 hover:border-brass/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-xl text-foreground">{p.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          p.is_processed ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        }`}>
                          {p.is_processed ? "Processed" : "Draft"}
                        </span>
                      </div>

                      <div className="space-y-2 font-mono text-xs text-muted-foreground border-t border-border/40 pt-4">
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="text-foreground">{new Date(p.start_date).toLocaleDateString("en-GB")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span className="text-foreground">{new Date(p.end_date).toLocaleDateString("en-GB")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/40 flex justify-end gap-2">
                      <button
                        onClick={() => handleCalculate(p.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[10px] rounded transition-all shadow"
                      >
                        <Play className="size-3" /> Compute Payroll
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Payslip Archives */}
        {activeTab === "payslips" && (
          <div className="space-y-4">
            {isPayslipsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brass size-8" /></div>
            ) : !payslips || payslips.length === 0 ? (
              <div className="bg-card border border-border p-12 text-center rounded-lg">
                <FileText className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-foreground mb-1">No payslips calculated</h3>
                <p className="text-muted-foreground text-sm font-mono max-w-sm mx-auto">
                  Click 'Compute Payroll' under Month Cycles to process payslips.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-navy border-b border-border text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Employee Name</th>
                        <th className="py-4 px-6">Basic Pay</th>
                        <th className="py-4 px-6">Gross Pay</th>
                        <th className="py-4 px-6">Total Deductions</th>
                        <th className="py-4 px-6">Net Salary</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono text-xs text-foreground/90">
                      {payslips.map((pay: any) => (
                        <tr key={pay.id} className="hover:bg-muted/30">
                          <td className="py-4 px-6 font-serif text-sm font-semibold">{pay.employee_name}</td>
                          <td className="py-4 px-6">KSH {parseFloat(pay.basic_pay).toLocaleString()}</td>
                          <td className="py-4 px-6 text-emerald-500 font-bold">KSH {parseFloat(pay.gross_pay).toLocaleString()}</td>
                          <td className="py-4 px-6 text-rose-500">KSH {parseFloat(pay.total_deductions).toLocaleString()}</td>
                          <td className="py-4 px-6 text-brass font-extrabold text-sm">KSH {parseFloat(pay.net_pay).toLocaleString()}</td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setViewingPayslip(pay)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card text-foreground hover:bg-muted text-[10px] font-bold uppercase tracking-wider rounded transition-all"
                            >
                              <Eye className="size-3.5 text-brass" /> View Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Salary/Tax Components (Pay Accounts) */}
        {activeTab === "components" && (
          <div className="space-y-4">
            {!components || components.length === 0 ? (
              <div className="bg-card border border-border p-12 text-center rounded-lg">
                <Coins className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-foreground mb-1">No custom accounts</h3>
                <p className="text-muted-foreground text-sm font-mono max-w-sm mx-auto">
                  Setup custom earnings or deductibles. The system will fall back to standard Kenyan tax schedules if no custom ones are defined.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((comp: any) => (
                  <div key={comp.id} className="bg-card border border-border rounded-lg p-6 hover:border-brass/30 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-serif text-lg text-foreground">{comp.name}</h3>
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brass-light">{comp.component_type}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteComponent(comp.id)}
                          className="text-rose-500 hover:bg-rose-500/10 p-1.5 rounded transition-all"
                          title="Remove Component"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                      <div className="space-y-2 border-t border-border/40 pt-4 font-mono text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Calculation type:</span>
                          <span className="text-foreground">{comp.calculation_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Default value:</span>
                          <span className="text-foreground font-bold">{comp.default_value}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Employee Salary Mapping */}
        {activeTab === "structures" && (
          <div className="space-y-4">
            {!employeeStructures || employeeStructures.length === 0 ? (
              <div className="bg-card border border-border p-12 text-center rounded-lg">
                <Settings className="size-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-serif text-foreground mb-1">No mapped salary structures</h3>
                <p className="text-muted-foreground text-sm font-mono max-w-sm mx-auto">
                  Begin mapping dynamic salary allowances or basic salary parameters to employees.
                </p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-navy border-b border-border text-muted-foreground font-mono text-xs uppercase tracking-wider">
                        <th className="py-4 px-6">Employee</th>
                        <th className="py-4 px-6">Salary Component</th>
                        <th className="py-4 px-6">Custom Salary/Rate</th>
                        <th className="py-4 px-6">Component Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 font-mono text-xs text-foreground/90">
                      {employeeStructures.map((struct: any) => (
                        <tr key={struct.id} className="hover:bg-muted/30">
                          <td className="py-4 px-6 font-serif text-sm font-semibold">{struct.employee_name}</td>
                          <td className="py-4 px-6 font-bold">{struct.component_details?.name}</td>
                          <td className="py-4 px-6 text-brass text-sm font-bold">KSH {parseFloat(struct.custom_value || struct.component_details?.default_value).toLocaleString()}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              struct.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            }`}>
                              {struct.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODALS */}
        
        {/* Period modal */}
        {isPeriodModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 bg-navy border-b border-border">
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                  <Calendar className="text-brass size-5" /> Open Month Cycle
                </h3>
                <button onClick={() => setIsPeriodModalOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded"><Eye className="size-4" /></button>
              </div>

              <form onSubmit={handleCreatePeriod} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cycle Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. May 2026"
                    value={periodName}
                    onChange={(e) => setPeriodName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsPeriodModalOpen(false)} className="px-4 py-2 border border-border text-foreground rounded text-xs uppercase tracking-wider font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brass text-navy-deep rounded text-xs uppercase tracking-wider font-bold">Open Cycle</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Component Modal */}
        {isComponentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 bg-navy border-b border-border">
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                  <Coins className="text-brass size-5" /> Create Pay Account
                </h3>
                <button onClick={() => setIsComponentModalOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded"><Eye className="size-4" /></button>
              </div>

              <form onSubmit={handleCreateComponent} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Component Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basic Salary, Housing Allowance"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Component Type</label>
                  <select
                    value={compType}
                    onChange={(e) => setCompType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  >
                    <option value="EARNING">Earning</option>
                    <option value="DEDUCTION">Deduction</option>
                    <option value="STATUTORY">Statutory Deduction</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Calculation Rule</label>
                  <select
                    value={compCalc}
                    onChange={(e) => setCompCalc(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  >
                    <option value="FIXED">Fixed Amount</option>
                    <option value="PCT_BASIC">Percentage of Basic Salary</option>
                    <option value="PCT_GROSS">Percentage of Gross Salary</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Value</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Rate or Amount"
                    value={compDefaultVal}
                    onChange={(e) => setCompDefaultVal(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="compTaxable"
                    checked={compTaxable}
                    onChange={(e) => setCompTaxable(e.target.checked)}
                    className="accent-brass"
                  />
                  <label htmlFor="compTaxable" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">Taxable component</label>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsComponentModalOpen(false)} className="px-4 py-2 border border-border text-foreground rounded text-xs uppercase tracking-wider font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brass text-navy-deep rounded text-xs uppercase tracking-wider font-bold">Register Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Salary Mapping Modal */}
        {isStructureModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 bg-navy border-b border-border">
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                  <Settings className="text-brass size-5" /> Map Employee Salary
                </h3>
                <button onClick={() => setIsStructureModalOpen(false)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded"><Eye className="size-4" /></button>
              </div>

              <form onSubmit={handleCreateStructure} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Employee</label>
                  <select
                    value={selectedEmp}
                    required
                    onChange={(e) => setSelectedEmp(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees?.results?.map((emp: any) => (
                      <option key={emp.id} value={emp.id}>{emp.full_name || emp.username}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Pay Account</label>
                  <select
                    value={selectedComp}
                    required
                    onChange={(e) => setSelectedComp(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  >
                    <option value="">-- Choose Account --</option>
                    {components?.map((comp: any) => (
                      <option key={comp.id} value={comp.id}>{comp.name} ({comp.component_type})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custom Value (Optional Override)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 45000"
                    value={customVal}
                    onChange={(e) => setCustomVal(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded text-foreground outline-none focus:border-brass/50 font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsStructureModalOpen(false)} className="px-4 py-2 border border-border text-foreground rounded text-xs uppercase tracking-wider font-bold">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-brass text-navy-deep rounded text-xs uppercase tracking-wider font-bold">Assign Account</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payslip View Modal */}
        {viewingPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-xl overflow-hidden flex flex-col">
              <div className="flex justify-between items-center px-6 py-4 bg-navy border-b border-border">
                <h3 className="font-serif text-lg text-foreground flex items-center gap-2">
                  <Sparkles className="text-brass size-5" /> Official Employee Payslip
                </h3>
                <button onClick={() => setViewingPayslip(null)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded"><Eye className="size-4" /></button>
              </div>

              <div className="p-8 space-y-6 text-foreground bg-card">
                {/* Header metadata */}
                <div className="border-b border-border pb-4 flex justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold">{viewingPayslip.employee_name}</h2>
                    <p className="text-muted-foreground font-mono text-xs mt-1">Official staff payslip log</p>
                  </div>
                  <div className="text-right font-mono text-xs text-muted-foreground">
                    <div>Reference: Fahari-{viewingPayslip.id}</div>
                    <div className="text-brass font-bold">{viewingPayslip.period_name}</div>
                  </div>
                </div>

                {/* Earnings & Deductions lines */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-2 border-b border-border/40 pb-2 font-bold uppercase tracking-wider text-muted-foreground">
                    <span>Element Description</span>
                    <span className="text-right">Amount (KSH)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2">
                      <span>Basic Salary (Earnings)</span>
                      <span className="text-right text-emerald-500 font-bold">KSH {parseFloat(viewingPayslip.basic_pay).toLocaleString()}</span>
                    </div>

                    {viewingPayslip.lines?.map((line: any, index: number) => {
                      if (line.component_name === "Basic Salary") return null;
                      const isNeg = parseFloat(line.amount) < 0;
                      return (
                        <div key={index} className="grid grid-cols-2">
                          <span>{line.component_name}</span>
                          <span className={`text-right ${isNeg ? "text-rose-500" : "text-emerald-500"}`}>
                            KSH {parseFloat(line.amount).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Gross Earnings:</span>
                    <span className="text-emerald-500 font-bold">KSH {parseFloat(viewingPayslip.gross_pay).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Deductions:</span>
                    <span className="text-rose-500">KSH {parseFloat(viewingPayslip.total_deductions).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 font-bold text-sm">
                    <span className="font-serif">Net Salary (Disbursed):</span>
                    <span className="text-brass text-lg font-extrabold">KSH {parseFloat(viewingPayslip.net_pay).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button onClick={() => setViewingPayslip(null)} className="px-5 py-2 border border-border text-foreground hover:bg-muted rounded text-xs uppercase tracking-wider font-bold">Close Slip</button>
                  <button onClick={() => window.print()} className="flex items-center gap-1.5 px-5 py-2 bg-brass text-navy-deep hover:bg-brass-light rounded text-xs uppercase tracking-wider font-bold transition-colors">
                    <Download className="size-4" /> Print Payslip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
