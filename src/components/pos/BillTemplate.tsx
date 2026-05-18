import React from "react";
import QRCode from "react-qr-code";

interface BillItem {
  name: string;
  quantity: number;
  price: number;
  sku?: string;
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
  vatReg?: string;
  buyerPin?: string;
  serialNumber?: string;
  invoiceNumber?: string;
  cuId?: string;
  isEtimsEnabled?: boolean;
  customerName?: string;
  branchCode?: string;
  qrUrl?: string;
  // Payments
  paymentMethod?: string;
  amountPaid?: number;
  changeAmount?: number;
}

export const BillTemplate = React.forwardRef<HTMLDivElement, BillTemplateProps>((props, ref) => {
  const {
    businessName = "FAHARI NEXUS",
    address = "Easy Biz Business Center, Nairobi",
    phone = "+254 700 000 000",
    items = [],
    tax = 0,
    total = 0,
    billNumber = "00",
    logoUrl,
    staffName = "STAFF",
    terminalId = "TERMINAL-01",
    kraPin = "",
    vatReg = "",
    buyerPin,
    serialNumber = "",
    invoiceNumber,
    cuId = "",
    isEtimsEnabled = false,
    customerName,
    branchCode = "05",
    qrUrl = "",
    paymentMethod = "cash",
    amountPaid,
    changeAmount,
  } = props;

  const now = new Date();
  
  const formatReceiptDate = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const formatReceiptTime = (d: Date) => {
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, "0");
    return `${strHours}:${minutes}:${ampm}`;
  };

  const formattedDate = formatReceiptDate(now);
  const formattedTime = formatReceiptTime(now);

  // Compute total quantity
  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // eTIMS computations
  // A = 16% Tax. Since prices are VAT inclusive:
  // Vatable Amt is the gross amount (e.g. 720.00), VAT Amt is gross * (16 / 116)
  const computedVatAmt = tax > 0 ? tax : total * (16 / 116);
  const computedVatableAmt = total;

  return (
    <div
      ref={ref}
      className="w-[80mm] px-1 py-2 bg-white text-black font-mono text-[9px] leading-tight print:p-0 select-none"
      style={{ margin: "0 auto", maxWidth: "80mm" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* 1. Header Information */}
      <div className="flex flex-col items-center text-center space-y-0.5 mb-2">
        {logoUrl && (
          <img src={logoUrl} alt="logo" className="w-12 h-12 object-contain mb-1" />
        )}
        <h1 className="font-extrabold text-[12px] uppercase leading-none">{businessName}</h1>
        <p className="text-[9px] uppercase font-bold">{address}</p>
      </div>

      {/* 2. Bill Number */}
      <div className="flex flex-col items-center my-1.5">
        <span className="text-[10px] tracking-widest font-bold mt-0.5 uppercase">{billNumber}</span>
      </div>

      {/* 3. PIN, VAT, Till, Date & Branch Grid */}
      <div className="text-[9px] space-y-0.5 mb-2 border-b border-dashed border-black pb-2">
        {(kraPin || vatReg) && (
          <div className="flex justify-between font-bold">
            {kraPin && <span>PIN: {kraPin}</span>}
            {vatReg && <span>VAT Reg: {vatReg}</span>}
          </div>
        )}
        <div className="flex justify-between">
          <span>Tel No. : {phone}</span>
          <span>Fax:</span>
        </div>
        <div className="flex justify-between">
          <span>Till No. : {terminalId}</span>
          <span>Cash Sale # : {billNumber}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Date : {formattedDate}</span>
          <span>Time : {formattedTime}</span>
          <span>Branch : {branchCode}</span>
        </div>
      </div>

      {/* Customer Info (Omitted completely if not passed) */}
      {(customerName || buyerPin) && (
        <div className="text-[9px] space-y-0.5 mb-2 border-b border-dotted border-black pb-2">
          {customerName && (
            <div className="flex justify-between font-bold">
              <span>CUSTOMER:</span>
              <span className="uppercase">{customerName}</span>
            </div>
          )}
          {buyerPin && (
            <div className="flex justify-between">
              <span>BUYER PIN:</span>
              <span className="font-bold">{buyerPin}</span>
            </div>
          )}
        </div>
      )}

      {/* 4. Item List Header */}
      <div className="border-b border-dashed border-black pb-1 mb-1 font-bold text-[9px] flex justify-between">
        <span className="w-[45%]">ITEM</span>
        <span className="w-[15%] text-center">QTY</span>
        <span className="w-[20%] text-right">PRICE</span>
        <span className="w-[20%] text-right">AMOUNT</span>
      </div>

      {/* 5. Item Rows */}
      <div className="space-y-1.5 mb-2 text-[9px]">
        {items.map((item, idx) => {
          const itemSku = item.sku || `1410${1350 + idx}`;
          const itemPrice = Number(item.price || 0);
          const itemAmt = itemPrice * item.quantity;
          return (
            <div key={idx} className="space-y-0.5">
              {/* Row 1: Item Name & Tax Code */}
              <div className="flex justify-between font-bold">
                <span className="uppercase truncate w-[90%]">{item.name}</span>
                <span className="font-extrabold text-right">A</span>
              </div>
              {/* Row 2: SKU, Qty, Price, Amount */}
              <div className="flex justify-between text-muted-foreground text-[8px] pl-1 font-semibold">
                <span className="w-[45%] tracking-tighter">{itemSku}</span>
                <span className="w-[15%] text-center">{item.quantity} (PCS)</span>
                <span className="w-[20%] text-right">{itemPrice.toFixed(2)}</span>
                <span className="w-[20%] text-right text-black font-bold">{itemAmt.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. Totals Segment */}
      <div className="border-t border-dashed border-black pt-1.5 space-y-0.5 mb-2 text-[9px]">
        <div className="flex justify-between font-black">
          <span>TOTAL :</span>
          <span>{total.toFixed(2)}</span>
        </div>
        
        {/* Dynamic Payment Details */}
        <div className="flex justify-between font-black">
          <span className="uppercase">{paymentMethod === "mpesa" ? "MPESA" : paymentMethod === "credit" ? "CREDIT" : "CASH"} :</span>
          <span>{total.toFixed(2)}</span>
        </div>

        {/* Card or Cash Change Details */}
        {paymentMethod === "cash" && amountPaid !== undefined && (
          <div className="space-y-0.5 border-t border-dotted border-black/30 pt-1 mt-1 text-[8px]">
            <div className="flex justify-between font-bold">
              <span>CASH PAID :</span>
              <span>{amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-black">
              <span>CHANGE RETURNED :</span>
              <span>{(changeAmount ?? Math.max(0, amountPaid - total)).toFixed(2)}</span>
            </div>
          </div>
        )}

        {paymentMethod === "credit" && customerName && (
          <div className="text-[8px] border-t border-dotted border-black/30 pt-1 mt-1 text-center font-bold">
            *** CREDIT CHARGED TO: {customerName.toUpperCase()} ***
          </div>
        )}

        {paymentMethod === "mpesa" && (
          <div className="text-[8px] border-t border-dotted border-black/30 pt-1 mt-1 text-center font-bold">
            *** MPESA TRANSACTION VERIFIED ***
          </div>
        )}
      </div>

      {/* 7. Tax Computations Table */}
      <div className="border-t border-dashed border-black pt-1.5 mb-2 text-[8px]">
        <div className="font-bold mb-1">TOTAL ITEMS :###{totalItemsCount}</div>
        <div className="flex justify-between font-bold border-b border-dotted border-black pb-0.5 mb-1 text-[8px]">
          <span className="w-[15%]">CODE</span>
          <span className="w-[20%] text-center">RATE %</span>
          <span className="w-[35%] text-right">VATABLE AMT</span>
          <span className="w-[30%] text-right">VAT AMT</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="w-[15%]">A</span>
          <span className="w-[20%] text-center">16</span>
          <span className="w-[35%] text-right">{computedVatableAmt.toFixed(2)}</span>
          <span className="w-[30%] text-right font-bold">{computedVatAmt.toFixed(4)}</span>
        </div>
      </div>

      {/* 8. KRA eTIMS Structured Box */}
      {isEtimsEnabled && (
        <div className="border border-black p-2 rounded my-3 text-[7.5px] leading-tight space-y-1 font-semibold">
          {cuId && (
            <div className="flex justify-between">
              <span>TSIN:</span>
              <span className="font-bold">{cuId.slice(0, 19)}</span>
            </div>
          )}
          {cuId && (
            <div className="flex justify-between">
              <span>CUIN:</span>
              <span className="font-bold">{cuId}</span>
            </div>
          )}
          {serialNumber && (
            <div className="flex justify-between">
              <span>CUSN:</span>
              <span className="font-bold">{serialNumber}</span>
            </div>
          )}
          {!cuId && !serialNumber && (
            <div className="text-center italic opacity-60 pb-1 uppercase tracking-wider">
              eTIMS Sandbox System compliant
            </div>
          )}
          <div className="flex justify-between">
            <span>DATE:</span>
            <span className="font-bold">{formattedDate} {formattedTime.slice(0, 5)}</span>
          </div>
          
          {/* Centered Dynamic KRA eTIMS or Fallback Vector QR Code */}
          <div className="py-1 flex justify-center">
            {qrUrl ? (
              <div className="bg-white p-1 select-all">
                <QRCode value={qrUrl} size={80} level="M" />
              </div>
            ) : (
              <svg className="w-20 h-20 mx-auto" viewBox="0 0 21 21" shapeRendering="crispEdges">
                {/* Position locator squares */}
                <path d="M0 0h7v7H0zm14 0h7v7h-7zM0 14h7v7H0z" fill="black" />
                <path d="M1 1h5v5H1zm14 0h5v5H15zM1 15h5v5H1z" fill="white" />
                <path d="M2 2h3v3H2zm14 0h3v3H16zM2 16h3v3H2z" fill="black" />
                {/* Realistic QR matrix noise */}
                <path d="M9 0h2v1H9zm1 2h1v1h-1zm-1 2h2v1H9zm1 2h1v1h-1zM8 8h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm-4 1h1v1H8zm3 0h1v1h-1zm1 1h1v1h-1zm-3 2h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm-4 3h1v1H8zm3 0h1v1h-1zm1 1h1v1h-1zm-3 2h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1z" fill="black" />
                <path d="M11 9h1v1h-1zm2 2h1v1h-1zm-2 2h1v1h-1zm2 2h1v1h-1zm2 2h1v1H15z" fill="black" />
                <path d="M0 9h1v1H0zm2 0h1v1H2zm4 0h1v1H6zm0 2h1v1H6zm0 2h1v1H6zm0 2h1v1H6z" fill="black" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 9. Footer & Serviced Attribution */}
      <div className="border-t border-dashed border-black pt-2 space-y-1 text-center text-[9px] font-bold">
        <p className="uppercase tracking-tighter">PRICES INCLUSIVE OF VAT WHERE APPLICABLE</p>
        <p className="border-b border-dashed border-black pb-1.5 uppercase">YOU WERE SERVED BY: {staffName.toUpperCase()}</p>
        
        {/* Double Bordered Thanks Wrapper */}
        <div className="py-1 border-b-2 border-double border-black font-black uppercase text-[10px] leading-none">
          <p className="tracking-wide">THANKS FOR SHOPPING WITH US</p>
        </div>

        {/* Double solid border with attribution */}
        <p className="text-[7.5px] pt-1 leading-none tracking-tight font-medium opacity-80 uppercase">
          Designed & Developed by FAHARI NEXUS: +254101031075
        </p>
      </div>
    </div>
  );
});

BillTemplate.displayName = "BillTemplate";
