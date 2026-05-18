import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  PackagePlus,
  Layers,
  Truck,
  Users,
  Receipt,
  BarChart3,
  Settings,
  Building2,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  id?: string;
  label: string;
  to: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  search?: string;
  children?: NavChild[];
}

export const navSections: NavSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/" },
  { id: "pos", label: "Point of Sale", icon: ShoppingCart, to: "/pos" },
  { id: "restaurant-pro", label: "Restaurant Pro", icon: Utensils, to: "/restaurant" },
  { id: "bar-pro", label: "Bar Mode", icon: Wine, to: "/pos", search: "?section=bar" },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    children: [
      { label: "Products", to: "/inventory/products" },
      { label: "Categories", to: "/inventory/categories" },
      { label: "Batches", to: "/inventory/batches" },
      { label: "Stock Adjustments", to: "/inventory/adjustments" },
      { label: "Stock Transfers", to: "/inventory/transfers" },
      { label: "Inventory Settings", to: "/inventory/settings" },
    ],
  },
  {
    id: "purchases",
    label: "Purchases",
    icon: PackagePlus,
    children: [
      { label: "Overview", to: "/purchases/stock-in" },
      { label: "Suppliers", to: "/purchases/suppliers" },
      { label: "Purchase Orders", to: "/procurement/purchases" },
      { id: "rfq", label: "RFQ / Sourcing", to: "/procurement/rfq" },
      { id: "grn", label: "Goods Received (GRN)", to: "/procurement/grns" },
      { id: "inspection", label: "Quality Inspection", to: "/procurement/inspections" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Receipt,
    children: [
      { label: "Sales Dashboard", to: "/sales/dashboard" },
      { label: "All Sales (Ledger)", to: "/sales" },
      { label: "Summaries Report", to: "/sales/summaries" },
      { label: "Settings", to: "/sales/settings" },
    ],
  },
  { id: "customers", label: "Customers", icon: Users, to: "/customers" },
  {
    id: "hr",
    label: "Human Resources",
    icon: Users, // Reuse Users icon or import another one
    children: [
      { label: "Employees", to: "/hr/employees" },
      { label: "Shifts & Rota", to: "/hr/shifts" },
      { label: "Payroll", to: "/hr/payroll" },
      { label: "Leave", to: "/hr/leave" },
    ],
  },
  {
    id: "accommodation",
    label: "Accommodation",
    icon: Building2,
    children: [
      { label: "Floor Plan", to: "/accommodation/floor-plan" },
      { label: "Bookings", to: "/accommodation/bookings" },
      { label: "Rooms", to: "/accommodation/rooms" },
    ],
  },
  { id: "logistics", label: "Logistics", icon: Truck, to: "/logistics" },
  { id: "reports", label: "Reports", icon: BarChart3, to: "/reports" },
  { id: "company", label: "Company", icon: Building2, to: "/company" },
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
];

// Unused icon hint to satisfy tree-shaking expectations
export const _allIcons = { Layers };
