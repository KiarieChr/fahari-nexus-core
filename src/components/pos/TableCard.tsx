import React from "react";
import { Users, Clock, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

export type TableStatus = "available" | "occupied" | "billed" | "reserved" | "cleaning";

interface TableCardProps {
  id: string;
  tableNumber: string;
  status: TableStatus;
  capacity?: number;
  activeSession?: {
    startTime: Date;
    totalAmount: number;
    waiterName: string;
  };
  onClick: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  tableNumber,
  status,
  capacity = 4,
  activeSession,
  onClick,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case "occupied":
        return "bg-destructive/10 border-destructive/20 text-destructive-foreground";
      case "billed":
        return "bg-warning/10 border-warning/20 text-warning-foreground animate-pulse";
      case "reserved":
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      case "cleaning":
        return "bg-amber-600/10 border-amber-600/20 text-amber-600";
      default:
        return "bg-success/10 border-success/20 text-success-foreground";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "occupied":
        return "In Use";
      case "billed":
        return "Billing";
      case "reserved":
        return "Reserved";
      case "cleaning":
        return "Cleaning";
      default:
        return "Available";
    }
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer transition-all duration-300",
        "bg-card border-2 rounded-2xl p-6 hover:shadow-glow hover:-translate-y-1",
        status === "available"
          ? "border-border"
          : status === "occupied"
            ? "border-destructive/60 shadow-lg shadow-destructive/10"
            : "border-warning/60 shadow-lg shadow-warning/10",
      )}
    >
      {/* Table Number Badge */}
      <div
        className={cn(
          "absolute -top-3 -left-3 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-elevated transition-transform group-hover:scale-110",
          status === "available"
            ? "bg-primary text-primary-foreground"
            : status === "occupied"
              ? "bg-destructive text-destructive-foreground"
              : status === "billed"
                ? "bg-warning text-warning-foreground"
                : status === "reserved"
                  ? "bg-blue-500 text-white"
                  : "bg-amber-600 text-white",
        )}
      >
        {tableNumber}
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex justify-between items-start">
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
              getStatusStyles(),
            )}
          >
            {getStatusLabel()}
          </div>
          <div className="flex items-center text-muted-foreground text-sm">
            <Users className="w-4 h-4 mr-1" />
            {capacity}
          </div>
        </div>

        {status !== "available" && activeSession ? (
          <div className="space-y-3 pt-2">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-medium">
                {Math.floor((new Date().getTime() - activeSession.startTime.getTime()) / 60000)}m
                active
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Receipt className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="font-bold text-lg">
                Ksh {activeSession.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-muted-foreground border-t pt-2">
              Served by{" "}
              <span className="font-medium text-foreground">{activeSession.waiterName}</span>
            </div>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl text-muted-foreground group-hover:border-primary/30 transition-colors">
            <Users className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-sm">Ready to Seat</span>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity pointer-events-none" />

      {/* Bottom Status Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-colors",
          status === "available"
            ? "bg-success/40"
            : status === "occupied"
              ? "bg-destructive/60"
              : status === "billed"
                ? "bg-warning/60"
                : status === "reserved"
                  ? "bg-blue-500/60"
                  : "bg-amber-600/60",
        )}
      />
    </div>
  );
};
