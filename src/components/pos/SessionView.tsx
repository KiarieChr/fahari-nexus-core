import React from "react";
import {
  ArrowLeft,
  Send,
  Receipt,
  CreditCard,
  Plus,
  Minus,
  X,
  ChefHat,
  Beer,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BillTemplate } from "./BillTemplate";
import { usePrint } from "@/hooks/usePrint";
import { useRef, useState, useEffect } from "react";
import { MenuGrid } from "./MenuGrid";
import { CheckoutModal } from "./CheckoutModal";
import { SplitBillModal } from "./SplitBillModal";
import { PinPad } from "./PinPad";
import {
  useCreateSale,
  useCreateKDSOrder,
  useActiveSession,
  useCheckoutSession,
  useCreateDiningSession,
} from "@/lib/api-hooks";
import { KOTTemplate } from "./KOTTemplate";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: "pending" | "preparing" | "ready" | "served";
  round: number;
  station: "kitchen" | "bar";
}

interface SessionViewProps {
  tableNumber: string;
  onBack: () => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ tableNumber, onBack }) => {
  const billRef = useRef<HTMLDivElement>(null);
  const kotRef = useRef<HTMLDivElement>(null);
  const { printElement } = usePrint();
  const createSale = useCreateSale();
  const createKDSOrder = useCreateKDSOrder();
  const checkoutSession = useCheckoutSession();
  const createDiningSession = useCreateDiningSession();

  const { data: activeSession, isLoading: sessionLoading } = useActiveSession(tableNumber);

  const [viewMode, setViewMode] = useState<"history" | "menu">("history");
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [showManagerPin, setShowManagerPin] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "void" | "discount";
    payload: any;
  } | null>(null);

  const MANAGER_PIN = "0000";
  const [orderHistory, setOrderHistory] = useState<OrderItem[]>([]);

  // Sync database session data to local order history
  useEffect(() => {
    if (activeSession && activeSession.tickets) {
      const flattenedItems: OrderItem[] = [];

      activeSession.tickets.forEach((ticket: any, index: number) => {
        const round = index + 1; // Backend doesn't have rounds yet, so we use ticket sequence
        ticket.items.forEach((item: any) => {
          flattenedItems.push({
            id: String(item.id),
            name: item.product_name,
            quantity: item.quantity,
            price: item.price || 0, // We might need to ensure price is in the serializer
            status: ticket.status as any,
            round: round,
            station: ticket.station as any,
          });
        });
      });

      setOrderHistory(flattenedItems);
    }
  }, [activeSession]);

  const [draftItems, setDraftItems] = useState<any[]>([]);

  const handleAddItem = (product: any) => {
    setDraftItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { ...product, quantity: 1, price: product.selling_price }];
    });
  };

  const handleRemoveDraft = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleVoidItem = (id: string) => {
    setPendingAction({ type: "void", payload: id });
    setShowManagerPin(true);
  };

  const confirmVoidItem = () => {
    if (pendingAction?.type === "void") {
      setOrderHistory((prev) => prev.filter((item) => item.id !== pendingAction.payload));
      setShowManagerPin(false);
      setPendingAction(null);
    }
  };

  const handleSendToKitchen = async () => {
    try {
      const nextRound = Math.max(...orderHistory.map((h) => h.round), 0) + 1;

      const kdsPayload = {
        table_number: tableNumber,
        round: nextRound,
        items: draftItems.map((d) => ({
          product_id: d.id,
          name: d.name,
          quantity: d.quantity,
          station: d.category_type === "bar" ? "bar" : "kitchen",
        })),
      };

      // 1. Send to Backend KDS
      await createKDSOrder.mutateAsync(kdsPayload);

      // 2. Print Physical KOT
      if (kotRef.current) {
        await printElement(kotRef.current);
      }

      // 3. Update Local State
      const newItems: OrderItem[] = draftItems.map((d) => ({
        id: Math.random().toString(),
        name: d.name,
        quantity: d.quantity,
        price: d.selling_price || d.price,
        status: "pending",
        round: nextRound,
        station: d.category_type === "bar" ? "bar" : "kitchen",
      }));

      setOrderHistory((prev) => [...prev, ...newItems]);
      setDraftItems([]);
    } catch (err) {
      console.error("Failed to send order to kitchen:", err);
    }
  };

  const rounds = Array.from(new Set(orderHistory.map((item) => item.round))).sort((a, b) => b - a);
  const subtotal = orderHistory.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const draftTotal = draftItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background overflow-hidden">
      {/* Left Side: Order History */}
      <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b px-6 flex items-center justify-between bg-card/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                Table {tableNumber}
                {activeSession ? (
                  <span className="text-xs font-normal px-2 py-0.5 bg-destructive/10 text-destructive rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-normal px-2 py-0.5 bg-success/10 text-success rounded-full">
                    Available
                  </span>
                )}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />{" "}
                {activeSession
                  ? `Active since ${new Date(activeSession.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : "No active session"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-xl p-1 mr-2">
              <button
                onClick={() => setViewMode("history")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  viewMode === "history"
                    ? "bg-card shadow-soft text-primary"
                    : "text-muted-foreground",
                )}
              >
                History
              </button>
              <button
                onClick={() => setViewMode("menu")}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  viewMode === "menu"
                    ? "bg-card shadow-soft text-primary"
                    : "text-muted-foreground",
                )}
              >
                Menu
              </button>
            </div>
            <button
              onClick={() => setShowSplit(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Split Bill
            </button>
          </div>
        </header>

        {/* Main Content Area: History or Menu */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {viewMode === "history" ? (
            !activeSession ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
                <div className="max-w-md bg-card/40 border backdrop-blur-md rounded-3xl p-8 shadow-elevated space-y-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
                    <UtensilsCrossed className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-xl">Table {tableNumber} is Available</h3>
                    <p className="text-sm text-muted-foreground px-4">
                      Start a dining session to open this table for guests, set up order tickets, and send requests directly to the kitchen and bar.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await createDiningSession.mutateAsync({ tableNumber });
                      } catch (err) {
                        console.error("Failed to start session:", err);
                      }
                    }}
                    disabled={createDiningSession.isPending}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {createDiningSession.isPending ? "Starting Session..." : "Start Dining Session"}
                  </button>
                  <button
                    onClick={() => setViewMode("menu")}
                    className="w-full py-3 bg-secondary text-secondary-foreground font-semibold rounded-2xl hover:opacity-90 transition-opacity"
                  >
                    Browse Menu & Order
                  </button>
                </div>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 text-muted-foreground opacity-60">
                <ChefHat className="w-16 h-16 mb-4" />
                <h3 className="font-bold text-lg">Session Started</h3>
                <p className="text-sm max-w-xs mt-1">
                  Table {tableNumber} is open. Add items from the menu to send your first round to the kitchen!
                </p>
                <button
                  onClick={() => setViewMode("menu")}
                  className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-soft hover:opacity-90 transition-opacity"
                >
                  Open Menu
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                {rounds.map((roundNum) => (
                  <div key={roundNum} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                        Round {roundNum}
                      </h3>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    <div className="space-y-1">
                      {orderHistory
                        .filter((item) => item.round === roundNum)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center",
                                  item.station === "kitchen"
                                    ? "bg-orange-500/10 text-orange-500"
                                    : "bg-blue-500/10 text-blue-500",
                                )}
                              >
                                {item.station === "kitchen" ? (
                                  <ChefHat className="w-5 h-5" />
                                ) : (
                                  <Beer className="w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × Ksh {item.price.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded-full border",
                                  item.status === "served"
                                    ? "bg-success/10 text-success border-success/20"
                                    : "bg-warning/10 text-warning border-warning/20",
                                )}
                              >
                                {item.status}
                              </span>
                              <p className="font-bold text-sm w-24 text-right">
                                Ksh {(item.price * item.quantity).toLocaleString()}
                              </p>
                              <button
                                onClick={() => handleVoidItem(item.id)}
                                className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
              <MenuGrid onAddItem={handleAddItem} />
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Current Draft & Actions */}
      <div className="w-full lg:w-96 flex flex-col bg-card shadow-elevated z-10">
        <div className="h-16 border-b px-6 flex items-center bg-card/50">
          <h3 className="font-bold">Current Order</h3>
          <span className="ml-auto bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-lg">
            {draftItems.length} items
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {draftItems.length > 0 ? (
            draftItems.map((item) => (
              <div
                key={item.id}
                className="bg-background/50 border rounded-2xl p-4 space-y-3 animate-in slide-in-from-right-4"
              >
                <div className="flex justify-between items-start">
                  <p className="font-bold text-sm">{item.name}</p>
                  <button
                    onClick={() => handleRemoveDraft(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-background border rounded-xl p-1 gap-4">
                    <button className="p-1 hover:bg-muted rounded-lg transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button className="p-1 hover:bg-muted rounded-lg transition-colors text-primary">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-bold">
                    Ksh {(item.selling_price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40">
              <Plus className="w-12 h-12 mb-2" />
              <p className="text-sm font-medium text-center px-8">
                No items in draft. Add from the menu to start.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-muted/30 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Total</span>
              <span className="font-semibold">Ksh {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Draft Items</span>
              <span className="font-semibold text-primary">
                + Ksh {draftTotal.toLocaleString()}
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-baseline">
              <span className="font-bold">Total Bill</span>
              <span className="text-2xl font-black text-primary">
                Ksh {(subtotal + draftTotal).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSendToKitchen}
              disabled={draftItems.length === 0}
              className={cn(
                "col-span-2 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                draftItems.length > 0
                  ? "bg-primary text-primary-foreground shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              <Send className="w-5 h-5" />
              Send to Kitchen
            </button>
            <button
              onClick={() => billRef.current && printElement(billRef.current)}
              className="py-3 bg-card border rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-muted transition-colors"
            >
              <Receipt className="w-4 h-4" />
              Print Bill
            </button>
            <button
              onClick={() => setShowCheckout(true)}
              className="py-3 bg-gold text-gold-foreground rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <CreditCard className="w-4 h-4" />
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCheckout && (
        <CheckoutModal
          total={subtotal + draftTotal}
          onClose={() => {
            if (checkoutSession.isSuccess) {
              setShowCheckout(false);
              onBack(); // Return to map only on success
            } else {
              setShowCheckout(false);
            }
          }}
          onConfirm={async (method) => {
            if (!activeSession) return;
            await checkoutSession.mutateAsync({
              sessionId: activeSession.id,
              paymentData: {
                payment_method: method,
                amount_paid: subtotal + draftTotal,
                discount_percentage: 0,
                tax_percentage: 0,
              },
            });
          }}
        />
      )}

      {showSplit && (
        <SplitBillModal
          total={subtotal + draftTotal}
          items={[...orderHistory, ...draftItems]}
          onClose={() => setShowSplit(false)}
          onConfirm={() => setShowSplit(false)}
        />
      )}

      {showManagerPin && (
        <PinPad
          title="Manager Override"
          description="A Manager PIN is required to void this item."
          correctPin={MANAGER_PIN}
          onSuccess={confirmVoidItem}
          onCancel={() => {
            setShowManagerPin(false);
            setPendingAction(null);
          }}
        />
      )}

      {/* Hidden Templates for Printing */}
      <div className="hidden">
        <BillTemplate
          ref={billRef}
          tableNumber={tableNumber}
          waiterName="John Doe"
          staffName="John Doe"
          billNumber={`BN-${Math.floor(Math.random() * 10000)}`}
          items={[...orderHistory, ...draftItems].map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))}
          subtotal={subtotal + draftTotal}
          total={subtotal + draftTotal}
        />
        <KOTTemplate
          ref={kotRef}
          tableNumber={tableNumber}
          waiterName="John Doe"
          orderType="Dine In"
          round={Math.max(...orderHistory.map((h) => h.round), 0) + 1}
          items={draftItems.map((d) => ({ name: d.name, quantity: d.quantity }))}
        />
      </div>
    </div>
  );
};
