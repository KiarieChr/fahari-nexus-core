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
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  label: string;
  to: string;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  to?: string;
  children?: NavChild[];
}

export const navSections: NavSection[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, to: "/" },
  { id: "pos", label: "Point of Sale", icon: ShoppingCart, to: "/pos" },
  {
    id: "inventory",
    label: "Inventory",
    icon: Boxes,
    children: [
      { label: "Products", to: "/inventory/products" },
      { label: "Batches", to: "/inventory/batches" },
      { label: "Stock Adjustments", to: "/inventory/adjustments" },
    ],
  },
  {
    id: "purchases",
    label: "Purchases",
    icon: PackagePlus,
    children: [
      { label: "Stock In", to: "/purchases/stock-in" },
      { label: "Suppliers", to: "/purchases/suppliers" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: Receipt,
    children: [
      { label: "All Sales", to: "/sales" },
      { label: "New Sale", to: "/pos" },
    ],
  },
  { id: "customers", label: "Customers", icon: Users, to: "/customers" },
  { id: "logistics", label: "Logistics", icon: Truck, to: "/logistics" },
  { id: "reports", label: "Reports", icon: BarChart3, to: "/reports" },
  { id: "company", label: "Company", icon: Building2, to: "/company" },
  { id: "settings", label: "Settings", icon: Settings, to: "/settings" },
];

// Unused icon hint to satisfy tree-shaking expectations
export const _allIcons = { Layers };