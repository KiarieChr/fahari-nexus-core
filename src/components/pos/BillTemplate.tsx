import React from "react";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
}

interface BillTemplateProps {
  businessName?: string;
  address?: string;
  phone?: string;
  tableNumber: string;
  waiterName: string;
  items: BillItem[];
  subtotal: number;
  tax?: number;
  total: number;
  billNumber: string;
  // Personalization
  logoUrl?: string;
  staffName: string;
  terminalId?: string;
  // eTIMS compliant fields
  kraPin?: string;
  buyerPin?: string;
  serialNumber?: string;
  invoiceNumber?: string;
  cuId?: string;
  isEtimsEnabled?: boolean;
}

export const BillTemplate = React.forwardRef<HTMLDivElement, BillTemplateProps>((props, ref) => {
  const {
    businessName = "FAHARI NEXUS RESTAURANT",
    address = "123 Business Avenue, Nairobi",
    phone = "+254 700 000 000",
    tableNumber,
    waiterName,
    items,
    subtotal,
    tax = 0,
    total,
    billNumber,
    logoUrl,
    staffName,
    terminalId,
    kraPin,
    buyerPin,
    serialNumber,
    invoiceNumber,
    cuId,
    isEtimsEnabled = false,
  } = props;

  return (
    <div
      ref={ref}
      className="w-[80mm] p-6 bg-white text-black font-mono text-[10px] leading-[1.2] print:p-0"
      style={{ margin: "0 auto" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
      {/* Logo & Header */}
      <div className="flex flex-col items-center text-center space-y-1 mb-4">
        {logoUrl && (
          <img src={logoUrl} alt="logo" className="w-16 h-16 object-contain mb-2" />
        )}
        <h1 className="font-black text-sm uppercase leading-none">{businessName}</h1>
        <p className="uppercase">{address}</p>
        <p>TEL: {phone}</p>
        {kraPin && <p className="font-bold">P.I.N: {kraPin}</p>}
      </div>

      <div className="text-center py-2 border-y border-black border-dashed mb-4 font-bold tracking-widest">
        - START OF FISCAL RECEIPT -
      </div>

      {/* Transaction Details */}
      <div className="space-y-0.5 mb-4">
        <div className="flex justify-between">
          <span>Tmn ID:</span>
          <span>{terminalId || "TERMINAL-01"}</span>
        </div>
        <div className="flex justify-between">
          <span>Trans no:</span>
          <span>{billNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>{waiterName}:</span>
          <span className="font-bold uppercase">{staffName}</span>
        </div>
        {buyerPin && (
          <div className="flex justify-between">
            <span>Customer PIN:</span>
            <span>{buyerPin}</span>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div className="space-y-2 mb-4">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between">
              <span className="w-full truncate">{idx + 1}. {item.name}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span>KES {item.price.toLocaleString()} x {item.quantity}</span>
              <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Details */}
      <div className="border-t border-black border-dashed pt-2 space-y-0.5 mb-4">
        <div className="text-center font-bold mb-2">--------- PAYMENT DETAILS ---------</div>
        <div className="flex justify-between">
          <span>SUB Incl. TAX:</span>
          <span>{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT 16%:</span>
          <span>{tax?.toLocaleString() || "0.00"}</span>
        </div>
        <div className="flex justify-between text-sm font-black pt-2 border-t border-black mt-2">
          <span>Amount Due:</span>
          <span>{total.toLocaleString()}</span>
        </div>
      </div>

      {/* Tax Breakdown (eTIMS Style) */}
      <div className="border-t border-black border-dashed pt-2 space-y-0.5 mb-4">
        <div className="grid grid-cols-3 font-bold border-b border-black pb-1 mb-1">
          <span>VATGrp</span>
          <span className="text-center">VATABLE AMT</span>
          <span className="text-right">VAT AMT</span>
        </div>
        <div className="grid grid-cols-3">
          <span>A - 16%</span>
          <span className="text-center">{subtotal.toLocaleString()}</span>
          <span className="text-right">{tax?.toLocaleString() || "0.00"}</span>
        </div>
      </div>

      {/* Control Unit Section */}
      {isEtimsEnabled && (
        <div className="border-t border-black border-dashed pt-2 space-y-1 mb-4">
          <div className="text-center font-bold">----- CONTROL UNIT INFO -----</div>
          <div className="flex flex-col gap-0.5 uppercase text-[8px]">
            <div className="flex justify-between">
              <span>CU Serial No:</span>
              <span className="font-bold">{serialNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>CU Invoice No:</span>
              <span className="font-bold">{invoiceNumber || "INV-" + billNumber}</span>
            </div>
          </div>
          <div className="flex flex-col items-center pt-4">
             {/* QR Code Placeholder */}
             <div className="w-40 h-40 border border-black p-2 bg-white flex flex-col items-center justify-center">
                <div className="w-full h-full border border-dashed border-black/20 flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]" />
                   <span className="text-[10px] font-bold z-10">eTIMS QR CODE</span>
                </div>
             </div>
             <p className="text-[8px] mt-2 font-bold uppercase">- END OF FISCAL RECEIPT -</p>
             <p className="text-[8px] uppercase tracking-tighter">REAL-TIME ETR SOLUTION</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-4 pt-4 border-t border-black border-dashed opacity-70">
        <p>Thank you for your business!</p>
        <p className="text-[7px]">Powered by Fahari Nexus ERP</p>
      </div>
    </div>
  );
});

BillTemplate.displayName = "BillTemplate";
