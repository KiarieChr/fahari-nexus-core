// ============================================================
// AUTO-GENERATED — DO NOT EDIT MANUALLY
// Use: .\bump.ps1 -BumpType patch|minor|major -Changes "desc1","desc2"
// ============================================================

export type ChangeType = "added" | "fixed" | "changed" | "removed" | "security";
export type BumpType  = "major" | "minor" | "patch";

export interface ChangelogItem {
  type: ChangeType;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  bumpType: BumpType;
  changes: ChangelogItem[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: "1.5.3",
    date: "2026-05-20",
    bumpType: "patch",
    changes: [
      { type: "fixed",   description: "POS receipt now shows the logged-in company name, address & phone — no more hardcoded 'Fahari Nexus'" },
      { type: "fixed",   description: "M-Pesa checkout modal no longer causes the POS page to reset/refresh behind it" },
      { type: "fixed",   description: "Recipe ingredient POST was sending a string unit name — now correctly sends the UnitOfMeasure integer FK ID" },
      { type: "fixed",   description: "Sales ledger reprint now uses live company data from useCompany() instead of placeholders" },
      { type: "added",   description: "Auto-print receipt toggle on POS sidebar — persisted in localStorage, defaults to ON" },
      { type: "added",   description: "When auto-print is OFF: manual Print Receipt + New Sale buttons appear on success modal (cash & M-Pesa)" },
      { type: "added",   description: "M-Pesa success screen shows Amount Paid and M-Pesa Transaction Code side-by-side" },
      { type: "added",   description: "Unit of Measure dropdown on Recipe Management loads live records from /api/v1/uom/" },
      { type: "added",   description: "useUnitsOfMeasure() hook added to api-hooks.ts with 5-minute cache" },
      { type: "added",   description: "activeBranchCode on POS dynamically resolved from useBranches() → main branch → eTIMS → fallback '05'" },
    ],
  },
  {
    version: "1.5.2",
    date: "2026-05-19",
    bumpType: "patch",
    changes: [
      { type: "added",   description: "M-Pesa STK Push integration on POS terminal with real-time auto-polling" },
      { type: "added",   description: "Manual M-Pesa verification tab (Paybill flow) on POS M-Pesa modal" },
      { type: "added",   description: "Receipt barcode for invoice number and eTIMS QR code on BillTemplate" },
      { type: "added",   description: "M-Pesa transaction reference line on printed receipts" },
      { type: "added",   description: "6mm left margin on thermal receipt for clean printing" },
      { type: "changed", description: "POS checkout button opens Cash Checkout Modal for cash payments" },
    ],
  },
  {
    version: "1.5.1",
    date: "2026-05-15",
    bumpType: "patch",
    changes: [
      { type: "added",   description: "Manager PIN pad gate for clearing POS basket and deleting cart items" },
      { type: "added",   description: "Loyalty points redemption on POS with live balance display" },
      { type: "added",   description: "Customer auto-link by phone number in Cash Checkout Modal" },
      { type: "fixed",   description: "POS cart now persists in localStorage across page reloads" },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-05-10",
    bumpType: "minor",
    changes: [
      { type: "added",   description: "Recipe Management module with Bill of Materials (BOM) and food cost analysis" },
      { type: "added",   description: "KDS (Kitchen Display System) ticket printing on restaurant orders" },
      { type: "added",   description: "Multi-section POS: General / Restaurant / Bar tabs" },
      { type: "added",   description: "Automatic ingredient deduction on kitchen order completion" },
    ],
  },
];
