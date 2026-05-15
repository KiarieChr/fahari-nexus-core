import React from "react";
import { Search, Filter, LayoutGrid, List } from "lucide-react";
import { TableCard } from "./TableCard";
import { useTables, Table } from "@/lib/api-hooks";

interface TableMapProps {
  onTableClick: (tableNumber: string, status: string, assignedPin: string) => void;
}

export const TableMap: React.FC<TableMapProps> = ({ onTableClick }) => {
  const { data, isLoading } = useTables();
  const tables = data?.results || [];

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
          <div className="flex bg-card border rounded-xl p-1">
            <button className="p-1.5 bg-muted rounded-lg">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
              <List className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Table Grid */}
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
                table.current_total
                  ? { totalAmount: table.current_total, startTime: new Date(), waiterName: "Staff" }
                  : undefined
              }
              onClick={() =>
                onTableClick(table.table_number, table.status, table.assigned_pin || "1234")
              }
            />
          ))
        )}
      </div>

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
