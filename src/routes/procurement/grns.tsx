import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, Plus, Search, CheckCircle2, Clock, AlertCircle,
  ClipboardCheck, MoreVertical, Building2, Package, ChevronRight
} from "lucide-react";
import { useGRNs } from "@/lib/api-hooks";
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
import { GRNCreateDialog } from "@/components/procurement/GRNCreateDialog";
import { InspectionFormDialog } from "@/components/procurement/InspectionFormDialog";

export const Route = createFileRoute("/procurement/grns")({
  component: GRNPage,
});

function GRNPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInspOpen, setIsInspOpen] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState<any>(null);
  const [search, setSearch] = useState("");
  const { data: grnData, isLoading } = useGRNs({ search });

  const handleBeginInspection = (grn: any) => {
    setSelectedGrn(grn);
    setIsInspOpen(true);
  };

  const grns = grnData?.results ?? grnData ?? [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "INSPECTED":
        return { color: "text-emerald-500 bg-emerald-500/10", icon: CheckCircle2 };
      case "PENDING_INSPECTION":
        return { color: "text-amber-500 bg-amber-500/10", icon: Clock };
      case "REJECTED":
        return { color: "text-rose-500 bg-rose-500/10", icon: AlertCircle };
      default:
        return { color: "text-slate-500 bg-slate-500/10", icon: Clock };
    }
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#030711] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Truck className="size-6" />
            </div>
            Goods Received Notes
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            GRN · Delivery Verification · Pre-Inspection Records
          </p>
        </div>
        <Button
          className="bg-brass text-navy font-bold uppercase tracking-widest text-[10px] h-11 px-6 hover:bg-brass-light transition-all shadow-lg shadow-brass/20"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="size-4 mr-2" />
          Record Delivery
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Pending Inspection", value: grns.filter((g: any) => g.status === "PENDING_INSPECTION").length, color: "text-amber-500" },
          { label: "Fully Inspected", value: grns.filter((g: any) => g.status === "INSPECTED").length, color: "text-emerald-500" },
          { label: "Rejected / Issues", value: grns.filter((g: any) => g.status === "REJECTED").length, color: "text-rose-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-2xl font-display", stat.color)}>
                {stat.value}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by GRN # or supplier..."
              className="pl-10 bg-white/5 border-white/10 h-10 rounded-xl text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-white/[0.01]">
            <TableRow className="border-white/5">
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">GRN #</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Supplier</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">PO Reference</TableHead>
              <TableHead className="text-[10px] uppercase font-bold tracking-widest">Received Date</TableHead>
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
            ) : grns.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="size-8 opacity-30" />
                    <p className="text-sm">No goods received yet. Record your first delivery.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              grns.map((grn: any) => {
                const { color, icon: StatusIcon } = getStatusConfig(grn.status);
                return (
                  <TableRow key={grn.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell>
                      <span className="text-xs font-bold text-white uppercase tracking-tighter">
                        #{grn.grn_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-md bg-white/5 grid place-items-center border border-white/5">
                          <Building2 className="size-3.5 text-brass" />
                        </div>
                        <span className="text-[11px] font-bold text-white">{grn.supplier_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {grn.purchase ? `PO #${grn.purchase}` : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {grn.received_date ? new Date(grn.received_date).toLocaleDateString() : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-[9px] font-bold px-2.5 py-0.5 rounded-full border-none uppercase tracking-widest", color)}>
                        <StatusIcon className="size-3 mr-1" />
                        {grn.status_display}
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
                          <DropdownMenuItem onClick={() => handleBeginInspection(grn)}>
                            <ClipboardCheck className="mr-2 size-4" />
                            Begin Inspection
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-muted-foreground">
                            View Details
                          </DropdownMenuItem>
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

      <GRNCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      <InspectionFormDialog 
        open={isInspOpen} 
        onOpenChange={setIsInspOpen} 
        grnId={selectedGrn?.id} 
      />
    </div>
  );
}
