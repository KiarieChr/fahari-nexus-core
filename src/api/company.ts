import { api } from "@/lib/api";

export interface Company {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  primary_address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  logo?: string;
  enable_restaurant_mode: boolean;
  enable_bar_mode: boolean;
  enable_retail_mode: boolean;
  enable_wholesale_mode: boolean;
  enable_hr_module: boolean;
  enable_accommodation_module: boolean;
  is_active: boolean;
}

export interface Branch {
  id: number;
  name: string;
  branch_code: string;
  description?: string;
  email?: string;
  phone_number?: string;
  land_phone?: string;
  address?: string;
  city?: string;
  operation_mode?: string;
  has_separate_accounting?: boolean;
  can_process_refunds_independently?: boolean;
  can_adjust_prices_independently?: boolean;
  shared_inventory_with_main?: boolean;
  is_main_branch?: boolean;
  is_active: boolean;
  is_open?: boolean;
}

export const companyApi = {
  getCompany: () => api.get<Company>("/api/v1/company/"),
  updateCompany: (data: Partial<Company>) => api.put<Company>("/api/v1/company/", data),
  getBranches: () => api.get<Branch[]>("/api/v1/branches/"),
};
