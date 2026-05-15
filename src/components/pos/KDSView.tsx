import React, { useState, useEffect, useRef } from "react";
import { KDSTicketCard, KDSTicket } from "./KDSTicketCard";
import { ChefHat, Beer, Filter, LayoutGrid, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { useKDSTickets, useUpdateKDSTicketStatus, useToggleKDSItem } from "@/lib/api-hooks";

// Mock data removed in favor of live API data

export const KDSView: React.FC = () => {
  const { data: ticketData, isLoading } = useKDSTickets();
  const updateStatus = useUpdateKDSTicketStatus();
  const toggleItem = useToggleKDSItem();
  const [activeStation, setActiveStation] = useState<"all" | "kitchen" | "bar">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { playNewOrderSound } = useNotifications();
  const prevTicketCount = useRef(0);

  // Map API data to frontend KDSTicket interface
  const tickets: KDSTicket[] = (ticketData?.results || []).map((t: any) => ({
    id: String(t.id),
    ticketNumber: t.ticket_number,
    tableNumber: t.table_number || "?",
    station: t.station,
    status: t.status,
    createdAt: new Date(t.created_at),
    items: (t.items || []).map((i: any) => ({
      id: String(i.id),
      name: i.product_name,
      quantity: i.quantity,
      notes: i.notes,
      isReady: i.is_prepared,
    })),
  }));

  // Sound notification effect
  useEffect(() => {
    if (tickets.length > prevTicketCount.current && prevTicketCount.current > 0) {
      if (soundEnabled) {
        playNewOrderSound();
      }
    }
    prevTicketCount.current = tickets.length;
  }, [tickets.length, soundEnabled, playNewOrderSound]);

  const handleStatusChange = (id: string, newStatus: KDSTicket["status"]) => {
    updateStatus.mutate({ ticketId: id, status: newStatus });
  };

  const handleItemToggle = (ticketId: string, itemId: string) => {
    toggleItem.mutate({ ticketId, itemId });
  };

  const filteredTickets = tickets
    .filter(
      (t) => (activeStation === "all" || t.station === activeStation) && t.status !== "served", // In a real KDS, hide tickets that are already served
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // FIFO: oldest first

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      {/* KDS Header */}
      <header className="h-20 bg-card border-b px-8 flex items-center justify-between shadow-soft z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-glow">
              <ChefHat className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Kitchen Display</h1>
          </div>

          <div className="h-8 w-px bg-border mx-2" />

          <div className="flex bg-muted rounded-2xl p-1 gap-1">
            <StationButton
              active={activeStation === "all"}
              onClick={() => setActiveStation("all")}
              icon={<LayoutGrid className="w-4 h-4" />}
              label="All"
            />
            <StationButton
              active={activeStation === "kitchen"}
              onClick={() => setActiveStation("kitchen")}
              icon={<ChefHat className="w-4 h-4" />}
              label="Kitchen"
            />
            <StationButton
              active={activeStation === "bar"}
              onClick={() => setActiveStation("bar")}
              icon={<Beer className="w-4 h-4" />}
              label="Bar"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold">{filteredTickets.length} Active Tickets</span>
            <span className="text-xs text-muted-foreground">Updated just now</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-3 rounded-xl transition-all",
              soundEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
            )}
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button className="p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Tickets Grid */}
      <main className="flex-1 overflow-x-auto p-8">
        <div className="flex gap-6 h-full min-w-max pb-4">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="w-80 h-full shrink-0">
              <KDSTicketCard
                ticket={ticket}
                onStatusChange={handleStatusChange}
                onItemToggle={handleItemToggle}
              />
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
              <ChefHat className="w-24 h-24 mb-4" />
              <p className="text-2xl font-bold italic tracking-widest uppercase">
                All clear, Chef!
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface StationButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const StationButton: React.FC<StationButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-300",
      active
        ? "bg-card text-foreground shadow-soft"
        : "text-muted-foreground hover:text-foreground",
    )}
  >
    {icon}
    {label}
  </button>
);
