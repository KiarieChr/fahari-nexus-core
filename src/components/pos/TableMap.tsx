import React, { useState } from "react";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { TableCard } from "./TableCard";
import { useTables, Table } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";

interface TableMapProps {
  onTableClick: (tableNumber: string, status: string, assignedPin: string) => void;
}

export const TableMap: React.FC<TableMapProps> = ({ onTableClick }) => {
  const { data, isLoading } = useTables();
  const tables = data?.results || [];
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    billed: tables.filter((t) => t.status === "billed").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  return (
    <div className="p-6 space-y-6 bg-background/50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Main Dining Floor</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              {stats.total} Total
            </span>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-sm font-semibold text-success">{stats.available} Available</span>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-sm font-semibold text-destructive">
              {stats.occupied} Occupied
            </span>
            <div className="h-1 w-1 rounded-full bg-border" />
            <span className="text-sm font-semibold text-warning">{stats.billed} Billed</span>
            {stats.reserved > 0 && (
              <>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-sm font-semibold text-blue-500">
                  {stats.reserved} Reserved
                </span>
              </>
            )}
            {stats.cleaning > 0 && (
              <>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-sm font-semibold text-amber-600">
                  {stats.cleaning} Cleaning
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search table..."
              className="pl-10 pr-4 py-2 bg-card border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all w-64"
            />
          </div>
          <button className="p-2 bg-card border rounded-xl hover:bg-muted transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="h-10 w-px bg-border mx-2" />
          <div className="flex bg-card border rounded-xl p-1 shadow-soft">
            <button
              onClick={() => setViewType("grid")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewType === "grid" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewType("list")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewType === "list" ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Grid or List */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            <div className="col-span-full h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            tables.map((table) => (
              <TableCard
                key={table.id}
                id={table.id.toString()}
                tableNumber={table.table_number}
                status={table.status}
                capacity={table.capacity}
                activeSession={
                  table.active_session
                    ? {
                        totalAmount: table.current_total,
                        startTime: new Date(table.active_session.opened_at),
                        waiterName: table.active_session.waiter_name
                      }
                    : undefined
                }
                onClick={() =>
                  onTableClick(table.table_number, table.status, table.assigned_pin || "1234")
                }
              />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            tables.map((table) => (
              <button
                key={table.id}
                onClick={() =>
                  onTableClick(table.table_number, table.status, table.assigned_pin || "1234")
                }
                className={cn(
                  "group flex items-center justify-between p-5 bg-card border-2 rounded-2xl hover:border-primary/50 hover:shadow-soft transition-all text-left",
                  table.status === "available"
                    ? "border-border"
                    : table.status === "occupied"
                      ? "border-destructive/60 shadow-md shadow-destructive/5"
                      : "border-warning/60 shadow-md shadow-warning/5"
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-soft shrink-0",
                      table.status === "available"
                        ? "bg-primary text-primary-foreground"
                        : table.status === "occupied"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-warning text-warning-foreground"
                    )}
                  >
                    {table.table_number}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">
                      {table.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Capacity: {table.capacity} seats
                      {table.active_session && (
                        <span className="ml-2 pl-2 border-l border-border text-primary font-bold">
                          Served by {table.active_session.waiter_name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                      table.status === "available"
                        ? "bg-success/10 text-success border-success/20"
                        : table.status === "occupied"
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : "bg-warning/10 text-warning border-warning/20"
                    )}
                  >
                    {table.status === "occupied" ? "In Use" : table.status}
                  </span>
                  {table.current_total > 0 && (
                    <span className="font-bold text-sm text-foreground">
                      Ksh {table.current_total.toLocaleString()}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {/* Legend */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border border-border/50 px-6 py-3 rounded-2xl shadow-elevated flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success shadow-md shadow-success/40" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive shadow-md shadow-destructive/40" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            In Use
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning shadow-md shadow-warning/40" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Billed
          </span>
        </div>
      </div>
    </div>
  );
};
