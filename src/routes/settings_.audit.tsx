import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  History,
  User as UserIcon,
  Activity,
  Database,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import { useAuditTrail } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/settings_/audit")({
  component: AuditTrailPage,
});

function AuditTrailPage() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [actionFilter, setActionFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useAuditTrail({
    page,
    page_size: pageSize,
    action: actionFilter || undefined,
    model_name: modelFilter || searchQuery || undefined,
  });

  const logs = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const getActionColor = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes("CREATE")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (a.includes("UPDATE")) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    if (a.includes("DELETE")) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (a.includes("LOGIN") || a.includes("LOGOUT")) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-slate-400 bg-slate-500/10 border-slate-500/20";
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-[#0A0D14] min-h-screen text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-display tracking-tight text-white flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <ShieldAlert className="size-6" />
            </div>
            Audit Trails
          </h2>
          <p className="text-muted-foreground uppercase tracking-[0.3em] text-[10px] font-bold">
            System Security & Activity Logs
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Total Logs", value: totalCount.toLocaleString(), icon: History, color: "text-indigo-500" },
          { label: "Today's Activity", value: "--", icon: Activity, color: "text-emerald-500" },
          { label: "System Events", value: "--", icon: Database, color: "text-blue-500" },
          { label: "Active Users", value: "--", icon: UserIcon, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex items-center gap-4">
            <div className={cn("size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5", stat.color)}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <h3 className="text-2xl font-display text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/5 bg-white/[0.01] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.02]">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by model name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl text-xs"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-indigo-500/60 transition-all appearance-none"
            >
              <option value="" className="bg-navy">All Actions</option>
              <option value="CREATE" className="bg-navy">Create</option>
              <option value="UPDATE" className="bg-navy">Update</option>
              <option value="DELETE" className="bg-navy">Delete</option>
              <option value="LOGIN" className="bg-navy">Login</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Filter className="size-3.5" />
            Filter Logs
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto min-h-[400px]">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="border-white/5">
                <TableHead className="text-[10px] uppercase font-bold tracking-widest pl-6 w-[200px]">Timestamp</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">User</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Action</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Model & ID</TableHead>
                <TableHead className="text-[10px] uppercase font-bold tracking-widest">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell className="pl-6"><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20 rounded-full bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32 bg-white/5" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full max-w-md bg-white/5" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={5} className="h-[300px] text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ShieldAlert className="size-10 mb-4 opacity-20" />
                      <p className="text-sm font-medium text-white mb-1">No logs found</p>
                      <p className="text-xs">Adjust your filters to see more results.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any, i: number) => (
                  <TableRow key={`${log.source}-${log.id}-${i}`} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <UserIcon className="size-3.5 text-indigo-400" />
                        </div>
                        <span className="text-xs font-bold text-white">{log.user}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", getActionColor(log.action))}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{log.model_name || "Unknown"}</span>
                        {log.object_id && (
                          <span className="text-[9px] text-muted-foreground font-mono mt-0.5">ID: {log.object_id}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-xl truncate" title={log.description}>
                        {log.description || "—"}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-2">
            Page {page} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="h-8 px-3 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-white disabled:opacity-50 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="size-3" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="h-8 px-3 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 hover:text-white disabled:opacity-50 transition-all flex items-center gap-1"
            >
              Next <ChevronRight className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
