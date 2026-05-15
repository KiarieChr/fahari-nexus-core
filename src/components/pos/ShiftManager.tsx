import React, { useState } from "react";
import {
  Calculator,
  Wallet,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrentShift, useStartShift, useEndShift, useMyWorkShifts } from "@/lib/api-hooks";
import { format } from "date-fns";

interface ShiftManagerProps {
  onClose: () => void;
}

export const ShiftManager: React.FC<ShiftManagerProps> = ({ onClose }) => {
  const { data: shift, isLoading } = useCurrentShift();
  const { data: myWorkShifts, isLoading: shiftsLoading } = useMyWorkShifts();
  const startShift = useStartShift();
  const endShift = useEndShift();

  const [openingCash, setOpeningCash] = useState<string>("");
  const [selectedWorkShift, setSelectedWorkShift] = useState<string>("");
  const [blindCash, setBlindCash] = useState<string>("");
  const [view, setView] = useState<"status" | "start" | "end" | "summary">("status");
  const [lastShiftSummary, setLastShiftSummary] = useState<any>(null);

  const handleStart = async () => {
    const amount = parseFloat(openingCash) || 0;
    await startShift.mutateAsync({
      openingCash: amount,
      workShiftAssignmentId: selectedWorkShift || undefined,
    });
    setView("status");
  };

  const handleEnd = async () => {
    if (!shift?.id) return;
    const amount = parseFloat(blindCash) || 0;
    const summary = await endShift.mutateAsync({ shiftId: shift.id, blindCash: amount });
    setLastShiftSummary(summary);
    setView("summary");
  };

  if (isLoading) return null;

  const isActive = shift && shift.status === "open";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Shift Management</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                Cash Reconciliation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {view === "status" && (
            <div className="space-y-8">
              {!isActive ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wallet className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No Active Shift</h3>
                  <p className="text-muted-foreground mb-8">
                    You must start a shift and enter your opening cash float before taking orders.
                  </p>
                  <button
                    onClick={() => setView("start")}
                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Start New Shift
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-muted/50 rounded-2xl border">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                        Started At
                      </p>
                      <p className="text-lg font-bold">
                        {format(new Date(shift.start_time), "HH:mm")}
                      </p>
                    </div>
                    <div className="p-5 bg-muted/50 rounded-2xl border">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-1">
                        Opening Float
                      </p>
                      <p className="text-lg font-bold">
                        KES {parseFloat(shift.opening_cash).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold">Shift is currently Active</p>
                      <p className="text-sm text-muted-foreground">
                        Orders are being tracked under your session.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setView("end")}
                    className="w-full py-4 bg-destructive text-destructive-foreground rounded-2xl font-bold text-lg shadow-soft hover:scale-[1.02] transition-all"
                  >
                    End Shift (Blind Count)
                  </button>
                </div>
              )}
            </div>
          )}

          {view === "start" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">
                    Pick Your Assigned Rota
                  </label>
                  <select
                    value={selectedWorkShift}
                    onChange={(e) => setSelectedWorkShift(e.target.value)}
                    className="w-full h-14 px-4 bg-muted rounded-2xl font-bold border-2 border-transparent focus:border-primary outline-none appearance-none cursor-pointer"
                  >
                    <option value="">No specific assignment (Walk-in)</option>
                    {myWorkShifts?.map((ws: any) => (
                      <option key={ws.id} value={ws.id}>
                        {ws.shift_details.name} ({ws.shift_details.start_time} -{" "}
                        {ws.shift_details.end_time})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-2 px-1">
                    Select the duty shift you are reporting for today.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">
                    Opening Cash Float
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xl">
                      KES
                    </span>
                    <input
                      type="number"
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-16 pl-20 pr-6 bg-muted rounded-2xl text-2xl font-bold border-2 border-transparent focus:border-primary focus:bg-card transition-all outline-none"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 px-1 italic">
                    Enter the total amount of cash currently in the drawer.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setView("status")}
                  className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={startShift.isPending}
                  className="flex-[2] py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-glow"
                >
                  {startShift.isPending ? "Starting..." : "Confirm & Open Shift"}
                </button>
              </div>
            </div>
          )}

          {view === "end" && (
            <div className="space-y-6 text-center">
              <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 gap-3 text-left mb-2">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium leading-tight">
                  <span className="font-bold block uppercase text-xs mb-1">
                    Blind Count Required
                  </span>
                  Enter the actual cash amount in the drawer. System totals are hidden to ensure
                  accuracy.
                </p>
              </div>

              <div className="text-left">
                <label className="text-sm font-bold text-muted-foreground uppercase mb-2 block">
                  Closing Cash Count
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-xl">
                    KES
                  </span>
                  <input
                    type="number"
                    value={blindCash}
                    onChange={(e) => setBlindCash(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-16 pl-20 pr-6 bg-muted rounded-2xl text-2xl font-bold border-2 border-transparent focus:border-destructive focus:bg-card transition-all outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setView("status")}
                  className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold"
                >
                  Back
                </button>
                <button
                  onClick={handleEnd}
                  disabled={endShift.isPending}
                  className="flex-[2] py-4 bg-destructive text-destructive-foreground rounded-2xl font-bold shadow-soft"
                >
                  {endShift.isPending ? "Calculating..." : "Submit Blind Count"}
                </button>
              </div>
            </div>
          )}

          {view === "summary" && lastShiftSummary && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold">Shift Reconciled</h3>
                <p className="text-muted-foreground">Detailed breakdown of your session.</p>
              </div>

              <div className="space-y-3">
                <SummaryItem label="System Expected" value={lastShiftSummary.closing_cash_system} />
                <SummaryItem label="Your Count" value={lastShiftSummary.closing_cash_blind} />
                <div className="pt-3 border-t">
                  <SummaryItem
                    label="Variance"
                    value={lastShiftSummary.variance}
                    isVariance
                    varianceValue={parseFloat(lastShiftSummary.variance)}
                  />
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-foreground text-background rounded-2xl font-bold text-lg mt-4"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, isVariance, varianceValue }: any) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm font-bold text-muted-foreground uppercase">{label}</span>
    <span
      className={cn(
        "text-lg font-bold",
        isVariance && varianceValue > 0 && "text-green-500",
        isVariance && varianceValue < 0 && "text-destructive",
        isVariance && varianceValue === 0 && "text-primary",
      )}
    >
      {isVariance && varianceValue > 0 ? "+" : ""}
      KES {parseFloat(value).toLocaleString()}
    </span>
  </div>
);
