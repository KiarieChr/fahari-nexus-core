import React, { forwardRef } from "react";

interface KOTItem {
  name: string;
  quantity: number;
  notes?: string;
}

interface KOTTemplateProps {
  tableNumber: string;
  waiterName: string;
  items: KOTItem[];
  orderType: string;
  round: number;
}

export const KOTTemplate = forwardRef<HTMLDivElement, KOTTemplateProps>(
  ({ tableNumber, waiterName, items, orderType, round }, ref) => {
    const timestamp = new Date().toLocaleString();

    return (
      <div ref={ref} className="w-[80mm] p-4 bg-white text-black font-mono text-sm">
        <div className="text-center border-b-2 border-black pb-2 mb-2">
          <h1 className="text-2xl font-bold">KITCHEN ORDER</h1>
          <p className="text-lg">Table: {tableNumber}</p>
          <div className="flex justify-between text-xs mt-1">
            <span>{orderType.toUpperCase()}</span>
            <span>ROUND #{round}</span>
          </div>
        </div>

        <div className="space-y-2 border-b-2 border-black pb-2 mb-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-start">
              <span className="text-xl font-bold">{item.quantity} x</span>
              <div className="flex-1 ml-4">
                <p className="text-lg font-bold">{item.name.toUpperCase()}</p>
                {item.notes && <p className="text-xs italic">* {item.notes}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs">
          <p>Waiter: {waiterName}</p>
          <p>Time: {timestamp}</p>
        </div>
      </div>
    );
  },
);

KOTTemplate.displayName = "KOTTemplate";
