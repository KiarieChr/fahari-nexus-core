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
  email?: string;
  phone_number?: string;
  city?: string;
  is_active: boolean;
}

export const companyApi = {
  getCompany: () => api.get<Company>("/api/v1/company/"),
  updateCompany: (data: Partial<Company>) => api.put<Company>("/api/v1/company/", data),
  getBranches: () => api.get<Branch[]>("/api/v1/branches/"),
};
