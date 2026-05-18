import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ClipboardCheck, Plus, Search, CheckCircle2, XCircle, AlertTriangle,
  MoreVertical, Building2, Boxes
} from "lucide-react";
import { useInspections } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { InspectionFormDialog } from "@/components/procurement/InspectionFormDialog";

export const Route = createFileRoute("/procurement/inspections")({
  component: InspectionsPage,
});

function InspectionsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGrnId, setSelectedGrnId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { data: inspData, isLoading } = useInspections();

  const inspections = inspData?.results ?? inspData ?? [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return { color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle2, label: "Approved" };
      case "PARTIAL":
        return { color: "text-amber-500 bg-amber-500/10", icon: AlertTriangle, label: "Partially Approved" };
      case "REJECTED":
        return { color: "text-rose-500 bg-rose-500/10", icon: XCircle, label: "Rejected" };
      default:
        return { color: "text-slate-500 bg-slate-500/10", icon: ClipboardCheck, label: status };
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#0A0D14] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <ClipboardCheck className="size-6" />
            </div>
            Quality Inspections
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            Incoming Quality Control · Batch Generation Pipeline
          </p>
        </div>
        <Button
          className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20"
          onClick={() => { setSelectedGrnId(null); setIsCreateOpen(true); }}
        >
          <Plus className="size-4 mr-2" />
          New Inspection
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Approved", value: inspections.filter((i: any) => i.status === "APPROVED").length, color: "text-emerald-500" },
          { label: "Partial / Issues", value: inspections.filter((i: any) => i.status === "PARTIAL").length, color: "text-amber-500" },
          { label: "Rejected", value: inspections.filter((i: any) => i.status === "REJECTED").length, color: "text-rose-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-display", stat.color)}>
                {stat.value}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Banner: Auto-batch on APPROVED */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 flex items-start gap-4">
        <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Boxes className="size-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-400 mb-0.5">Auto-Batch Generation Active</p>
          <p className="text-[11px] text-emerald-500/70 leading-relaxed">
            When an inspection is <strong>Approved</strong>, the system automatically creates a <strong>ProductBatch</strong> with status <code className="bg-white/5 px-1 rounded text-emerald-300">APPROVED</code> for each line item, updating live stock levels instantly.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search inspections..."
              className="pl-10 bg-white/5 border-white/10 h-10 rounded-xl text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/[0.01]">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Inspection ID</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">GRN Reference</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Inspector</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Status</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell colSpan={6}><Skeleton className="h-12 w-full bg-white/5" /></TableCell>
                </TableRow>
              ))
            ) : inspections.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ClipboardCheck className="size-8 opacity-30" />
                    <p className="text-sm">No inspections recorded yet.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              inspections.map((insp: any) => {
                const { color, icon: StatusIcon, label } = getStatusConfig(insp.status);
                return (
                  <TableRow key={insp.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell>
                      <span className="text-xs font-bold text-white font-mono">#{insp.id}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-brass font-bold">{insp.grn_number}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">{insp.inspector_name || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {insp.inspection_date ? new Date(insp.inspection_date).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border-none uppercase tracking-widest", color)}>
                        <StatusIcon className="size-3 mr-1" />
                        {label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="size-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>View Report</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-muted-foreground">View Batches Generated</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InspectionFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        grnId={selectedGrnId}
      />
    </div>
  );
}
