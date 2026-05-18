import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { EtimsConfig } from "@/api/integrations";

// Types
export interface DashboardStats {
  kpis: {
    total_sales: number;
    transaction_count: number;
    avg_sale_value: number;
    sales_growth_pct: number;
    inventory_value: number;
    low_stock_count: number;
    out_of_stock_count: number;
  };
  trends: {
    daily_sales: Array<{ date: string; label: string; total: number }>;
    category_sales: Array<{ name: string; value: number }>;
  };
  recent_sales: any[];
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  selling_price: number;
  stock_quantity: number;
  category_name: string;
  category_type?: "general" | "restaurant" | "bar";
  product_type?: "product" | "service" | "menu_item" | "raw_material";
  image?: string;
  image_url?: string;
  cost_price: number;
  markup_percentage: number;
  stock_levels?: any[];
  portions_available?: number;
}

export interface ProductBatch {
  id: number;
  batch_number: string;
  expiry_date: string | null;
  manufacturing_date: string | null;
  available_quantity: number;
  days_to_expiry: number | null;
  quality_status: string;
  supplier_name: string | null;
}

export interface Table {
  id: number;
  name: string;
  table_number: string;
  status: "available" | "occupied" | "billed" | "reserved" | "cleaning";
  capacity: number;
  assigned_pin: string;
  x: number;
  y: number;
  current_total?: number;
}

// Hooks
export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/dashboard/stats/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useProducts = (params?: any) => {
  return useQuery<{ results: Product[] }>({
    queryKey: ["products", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/products/", { params });
      // Normalize: backend may return plain array or { results: [] }
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useProductDetail = (id: number | null) => {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/products/${id}/`);
      return data;
    },
    enabled: !!id && typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useProductBatches = (productId: number | null) => {
  return useQuery<ProductBatch[]>({
    queryKey: ["product-batches", productId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/batches/?product=${productId}&is_active=true`);
      if (Array.isArray(data)) return data;
      return data.results || [];
    },
    enabled: !!productId && typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData: any) => {
      // Use FormData if there's an image
      let data = productData;
      if (productData.image instanceof File) {
        data = new FormData();
        Object.keys(productData).forEach((key) => {
          data.append(key, productData[key]);
        });
      }

      const response = await api.post("/api/v1/products/", data, {
        headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Use FormData if there's an image
      let payload = data;
      if (data.image instanceof File) {
        payload = new FormData();
        Object.keys(data).forEach((key) => {
          payload.append(key, data[key]);
        });
      }

      const response = await api.patch(`/api/v1/products/${id}/`, payload, {
        headers: payload instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
  });
};

export const useBulkUpload = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("excel_file", file);
      const response = await api.post("/api/v1/products/bulk-upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDownloadTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get("/api/v1/products/download-template/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "product_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};
export const useBatches = () => {
  return useQuery({
    queryKey: ["batches"],
    queryFn: async () => {
      const response = await api.get("/api/v1/batches/");
      return response.data;
    },
  });
};

export const useBatchAnalytics = () => {
  return useQuery({
    queryKey: ["batch-analytics"],
    queryFn: async () => {
      const response = await api.get("/api/v1/batches/analytics/");
      return response.data;
    },
  });
};

export const useApproveBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/v1/batches/${id}/approve/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["product-batches"] });
    },
  });
};

export const useRejectBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/v1/batches/${id}/reject/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      queryClient.invalidateQueries({ queryKey: ["product-batches"] });
    },
  });
};
export const useTransfers = () => {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const response = await api.get("/api/v1/transfers/");
      return response.data;
    },
  });
};

export const useMovements = (params?: any) => {
  return useQuery({
    queryKey: ["movements", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/movements/", { params });
      // Normalize plain array or paginated
      if (Array.isArray(response.data)) return { results: response.data };
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useCreateMovement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      product: number;
      movement_type: string;
      quantity: number;
      branch?: number;
      notes?: string;
      reference_number?: string;
      unit_cost?: number;
    }) => {
      const response = await api.post("/api/v1/movements/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useMovementAnalytics = () => {
  return useQuery({
    queryKey: ["movement-analytics"],
    queryFn: async () => {
      const response = await api.get("/api/v1/movements/analytics/");
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useReports = (params: string | { type: string }) => {
  const queryParams = typeof params === "string" ? { type: params } : params;
  return useQuery({
    queryKey: ["reports", queryParams],
    queryFn: async () => {
      const response = await api.get("/api/v1/reports/", { params: queryParams });
      return response.data;
    },
    enabled: !!queryParams.type && typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useDispatchTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post(`/api/v1/transfers/${id}/dispatch/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
};
export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const response = await api.get("/api/v1/branches/");
      return response.data;
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/transfers/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
};

export const useExportExcel = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.get("/api/v1/products/export-excel/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `products_export_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
};

// ── Inventory Journal ──────────────────────────────────────────────────────────
export interface AdjustStockPayload {
  adjustment_type: "add" | "remove" | "set";
  quantity: number;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  reason?: string;
  notes?: string;
}

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, payload }: { productId: number; payload: AdjustStockPayload }) => {
      const { data } = await api.post(`/api/v1/products/${productId}/adjust-stock/`, payload);
      return data;
    },
    onSuccess: (_data, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-batches", productId] });
    },
  });
};

// ── Super-admin: Sync stock quantities ────────────────────────────────────────
export const useSyncProductStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyId?: number) => {
      const { data } = await api.post("/api/v1/products/sync-stock/", companyId ? { company_id: companyId } : {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ── Super-admin: Create main branch ───────────────────────────────────────────
export interface CreateMainBranchPayload {
  company_id: number;
  branch_name?: string;
  branch_code?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const useCreateMainBranch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMainBranchPayload) => {
      const { data } = await api.post("/api/v1/branches/create-main-branch/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: any) => {
      const { data } = await api.post("/api/v1/categories/", categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useCategories = () => {
  return useQuery<{ results: any[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/categories/");
      // Normalize: backend may return plain array or { results: [] }
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useBrands = () => {
  return useQuery<{ results: any[] }>({
    queryKey: ["brands"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/brands/");
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post("/api/v1/auth/login/", credentials);
      return data;
    },
    onSuccess: (data) => {
      if (!data.two_factor_required) {
        localStorage.setItem("fahari-token", data.access);
        localStorage.setItem("fahari-refresh", data.refresh);
        localStorage.setItem("fahari-user", JSON.stringify(data.user));
      }
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (verifyData: { user_id: number; otp_code: string }) => {
      const { data } = await api.post("/api/v1/auth/verify-otp/", verifyData);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("fahari-token", data.access);
      localStorage.setItem("fahari-refresh", data.refresh);
      localStorage.setItem("fahari-user", JSON.stringify(data.user));
    },
  });
};

export const useMagicLink = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post("/api/v1/auth/magic-link/", { email });
      return data;
    },
  });
};

export const useVerifyMagicLink = () => {
  return useMutation({
    mutationFn: async (params: { token: string; email: string }) => {
      const { data } = await api.get("/api/v1/auth/magic-link/", { params });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("fahari-token", data.access);
      localStorage.setItem("fahari-refresh", data.refresh);
      localStorage.setItem("fahari-user", JSON.stringify(data.user));
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: any) => {
      try {
        // Remove confirm_password before sending (backend doesn't expect it)
        const { confirm_password, ...registrationData } = userData;

        const { data } = await api.post("/v1/auth/register/", registrationData);
        console.log("Registration success:", data);
        return data;
      } catch (error: any) {
        console.error("Registration error response:", error.response);
        console.error("Registration error:", error.message);
        throw error;
      }
    },
  });
};

export const useCreateSale = () => {
  return useMutation({
    mutationFn: async (saleData: any) => {
      const { data } = await api.post("/api/v1/sales/", saleData);
      return data;
    },
  });
};

export const useSuppliers = () => {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/suppliers/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const usePurchases = () => {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/purchases/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};
export const useUserProfile = () => {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/profile/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (profileData: any) => {
      const { data } = await api.put("/api/v1/profile/", profileData);
      return data;
    },
  });
};

export const useCompany = () => {
  return useQuery<any>({
    queryKey: ["company"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/company/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useInventorySettings = () => {
  return useQuery<any>({
    queryKey: ["inventory-settings"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/settings/inventory/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useUpdateInventorySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch("/api/v1/settings/inventory/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-settings"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (companyData: any) => {
      const { data } = await api.put("/api/v1/company/", companyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
    },
  });
};

export const useSales = (params?: any) => {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/sales/", { params });
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useIncrementSalePrintCount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (saleId: string | number) => {
      const { data } = await api.post(`/api/v1/sales/${saleId}/increment_print_count/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useTables = () => {
  return useQuery<{ results: Table[] }>({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/restaurant/tables/");
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
    refetchInterval: 5000, // Refresh every 5 seconds to show occupied state updates in real-time
  });
};

export const useCreateKDSOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (kdsData: any) => {
      const { data } = await api.post("/api/v1/kds/orders/", kdsData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kds-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["active-session"] });
    },
  });
};

export const useKDSTickets = (params?: any) => {
  return useQuery<{ results: any[] }>({
    queryKey: ["kds-tickets", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/kds/tickets/", { params });
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    refetchInterval: 5000,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useUpdateKDSTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const { data } = await api.post(`/api/v1/kds/tickets/${ticketId}/update_status/`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kds-tickets"] });
    },
  });
};

export const useToggleKDSItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, itemId }: { ticketId: string; itemId: string }) => {
      const { data } = await api.post(`/api/v1/kds/tickets/${ticketId}/items/${itemId}/toggle/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kds-tickets"] });
    },
  });
};

export const useCurrentShift = () => {
  return useQuery({
    queryKey: ["current-shift"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/pos/shifts/current/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
    retry: false, // Don't retry on 404 if no shift exists
  });
};

export const useActiveSession = (tableNumber: string) => {
  return useQuery({
    queryKey: ["active-session", tableNumber],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/dining/sessions/", {
        params: { table_number: tableNumber, status: "active" },
      });
      // Normalize plain array or paginated response
      const list = Array.isArray(data) ? data : (data.results || []);
      return list[0] || null;
    },
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("fahari-token") && !!tableNumber,
    refetchInterval: 10000, // Refresh every 10 seconds to keep KDS sync
  });
};

export const useCreateDiningSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tableNumber }: { tableNumber: string }) => {
      const { data } = await api.post("/api/v1/dining/sessions/", {
        table_number: tableNumber,
      });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["active-session", data.table_number] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useStartShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      openingCash,
      workShiftAssignmentId,
    }: {
      openingCash: number;
      workShiftAssignmentId?: string;
    }) => {
      const { data } = await api.post("/api/v1/pos/shifts/start_shift/", {
        opening_cash: openingCash,
        work_shift_assignment: workShiftAssignmentId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-shift"] });
    },
  });
};

export const useMyWorkShifts = () => {
  return useQuery({
    queryKey: ["my-work-shifts"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/hr/assignments/", {
        params: { my_assignments: true },
      });
      // Normalize plain array or paginated response
      if (Array.isArray(data)) return data;
      return data.results || [];
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useEndShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shiftId, blindCash }: { shiftId: string; blindCash: number }) => {
      const { data } = await api.post(`/api/v1/pos/shifts/${shiftId}/end_shift/`, {
        blind_cash: blindCash,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-shift"] });
    },
  });
};

export const useCheckoutSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sessionId, paymentData }: { sessionId: string; paymentData: any }) => {
      const { data } = await api.post(
        `/api/v1/dining/sessions/${sessionId}/checkout/`,
        paymentData,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-session"] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useRFQs = () => {
  return useQuery({
    queryKey: ["rfqs"],
    queryFn: async () => {
      const response = await api.get("/api/v1/rfqs/");
      return response.data;
    },
  });
};

export const useQuotations = () => {
  return useQuery({
    queryKey: ["quotations"],
    queryFn: async () => {
      const response = await api.get("/api/v1/quotations/");
      return response.data;
    },
  });
};

export const useReceivePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, items }: { id: number; items: any[] }) => {
      const response = await api.post(`/api/v1/purchases/${id}/receive/`, { items });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
};

export const useQuickStockIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { supplier_id: number; items: any[] }) => {
      const response = await api.post("/api/v1/purchases/quick-stock-in/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["movements"] });
    },
  });
};

// --- Procurement & Supply Chain Hooks ---

// Suppliers
export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/suppliers/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/suppliers/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/suppliers/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });
};

// Purchases
export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/purchases/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });
};

export const useUpdatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/purchases/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/purchases/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchases"] }),
  });
};

// RFQs
export const useCreateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/rfqs/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rfqs"] }),
  });
};

export const useUpdateRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/rfqs/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rfqs"] }),
  });
};

export const useDeleteRFQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/rfqs/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rfqs"] }),
  });
};

// Supplier Quotations
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/quotations/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/quotations/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/quotations/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["quotations"] }),
  });
};

// GRNs (Goods Received Notes)
export const useGRNs = (params?: any) => {
  return useQuery({
    queryKey: ["grns", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/grns/", { params });
      return response.data;
    },
  });
};

export const useCreateGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/grns/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grns"] }),
  });
};

export const useUpdateGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/grns/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grns"] }),
  });
};

export const useDeleteGRN = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/grns/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grns"] }),
  });
};

// Inspection Forms
export const useInspections = (params?: any) => {
  return useQuery({
    queryKey: ["inspections", params],
    queryFn: async () => {
      const response = await api.get("/api/v1/inspections/", { params });
      return response.data;
    },
  });
};

export const useCreateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/inspections/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspections"] }),
  });
};

export const useUpdateInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/inspections/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspections"] }),
  });
};

export const useDeleteInspection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/inspections/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inspections"] }),
  });
};

// Public Supplier Portal
export const usePublicQuote = (token: string) => {
  return useQuery({
    queryKey: ["public-quote", token],
    queryFn: async () => {
      const response = await api.get(`/api/v1/quote/public/${token}/`);
      return response.data;
    },
    enabled: !!token,
    retry: false, // Don't retry on 404
  });
};

export const useSubmitPublicQuote = () => {
  return useMutation({
    mutationFn: async ({ token, items, notes }: { token: string; items: any[]; notes?: string }) => {
      const response = await api.post(`/api/v1/quote/public/${token}/`, { items, notes });
      return response.data;
    },
  });
};
// --- CRM Hooks ---

export const useCustomers = (params?: any) => {
  return useQuery<{ results: any[] }>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/customers/", { params });
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/customers/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useDebtPayments = (customerId?: number) => {
  return useQuery<{ results: any[] }>({
    queryKey: ["debt-payments", customerId],
    queryFn: async () => {
      const params = customerId ? { customer: customerId } : {};
      const { data } = await api.get("/api/v1/debt/payments/", { params });
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useRecordDebtPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { customer: number; amount: number; payment_method: string; reference_number?: string; notes?: string }) => {
      const response = await api.post("/api/v1/debt/payments/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debt-payments"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useLoyaltyTransactions = (customerId?: number) => {
  return useQuery<{ results: any[] }>({
    queryKey: ["loyalty-transactions", customerId],
    queryFn: async () => {
      const params = customerId ? { customer: customerId } : {};
      const { data } = await api.get("/api/v1/loyalty/transactions/", { params });
      if (Array.isArray(data)) return { results: data };
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

// --- M-Pesa Hooks ---

export const useMpesaStkPush = () => {
  return useMutation({
    mutationFn: async (data: { phone: string; amount: number; sale_id?: number; session_id?: number }) => {
      const response = await api.post("/api/v2/mpesa/stk-push/", data);
      return response.data;
    },
  });
};

export const useMpesaTransactions = (checkoutRequestId?: string) => {
  return useQuery<{ results: any[] }>({
    queryKey: ["mpesa-transactions", checkoutRequestId],
    queryFn: async () => {
      const params = checkoutRequestId ? { checkout_request_id: checkoutRequestId } : {};
      const { data } = await api.get("/api/v2/integrations/mpesa-transactions/", { params });
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
    refetchInterval: (query) => {
      const results = query.state.data?.results || [];
      const isPending = results.some((t: any) => t.status === "PENDING");
      return isPending ? 3000 : false;
    },
  });
};

export const useEtimsConfig = () => {
  return useQuery<EtimsConfig[]>({
    queryKey: ["etims-config"],
    queryFn: async () => {
      const { data } = await api.get("/api/v2/integrations/etims-config/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

// Recipe & BOM management interfaces
export interface Recipe {
  id: number;
  menu_item: number;
  instructions?: string;
  preparation_time_minutes?: number;
  ingredients?: RecipeIngredientDetail[];
  base_cost?: number;
  food_cost_percentage?: number;
}

export interface RecipeIngredientDetail {
  id: number;
  recipe: number;
  ingredient: number;
  ingredient_name: string;
  ingredient_sku: string;
  ingredient_cost: number;
  quantity: number;
  unit_of_measure: string;
  wastage_allowance_pct: number;
}

export const useRecipeForProduct = (productId: number | null) => {
  return useQuery<Recipe | null>({
    queryKey: ["recipe", productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data } = await api.get("/api/v1/recipes/", { params: { menu_item: productId } });
      const results = Array.isArray(data) ? data : data.results || [];
      return results[0] || null;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token") && !!productId,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation<Recipe, any, Partial<Recipe>>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/v1/recipes/", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", data.menu_item] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation<Recipe, any, { id: number; data: Partial<Recipe> }>({
    mutationFn: async ({ id, data: payload }) => {
      const { data } = await api.patch(`/api/v1/recipes/${id}/`, payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe", data.menu_item] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAddRecipeIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation<any, any, any>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/v1/recipe-ingredients/", payload);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recipe"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useRemoveRecipeIngredient = () => {
  const queryClient = useQueryClient();
  return useMutation<any, any, number>({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/api/v1/recipe-ingredients/${id}/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// ==========================================
// Accounts & RBAC
// ==========================================

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get("/api/v1/accounts/users/");
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/accounts/users/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/accounts/users/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
};

export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/api/v1/accounts/roles/");
      return response.data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/accounts/roles/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/accounts/roles/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useLoadGeneralRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/v1/accounts/roles/load_general/");
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useLoadRestaurantRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/v1/accounts/roles/load_restaurant/");
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });
};

export const useLoadLocations = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await api.post("/api/v1/accounts/users/load_locations/");
      return response.data;
    },
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await api.get("/api/v1/accounts/permissions/");
      return response.data;
    },
  });
};

// ==========================================
// HR Shift Management
// ==========================================

export const useShifts = () => {
  return useQuery({
    queryKey: ["hr-shifts"],
    queryFn: async () => {
      const response = await api.get("/api/v1/hr/shifts/");
      return response.data;
    },
  });
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/hr/shifts/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-shifts"] }),
  });
};

export const useShiftAssignments = (filters?: any) => {
  return useQuery({
    queryKey: ["hr-shift-assignments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.date) params.append("date", filters.date);
      if (filters?.my_assignments) params.append("my_assignments", "true");
      const response = await api.get(`/api/v1/hr/assignments/?${params.toString()}`);
      return response.data;
    },
  });
};

export const useCreateShiftAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/hr/assignments/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hr-shift-assignments"] }),
  });
};

// ==========================================
// HR Employee Directory
// ==========================================

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await api.get("/api/v1/hr/employees/");
      return response.data;
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/hr/employees/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/hr/employees/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/hr/employees/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employees"] }),
  });
};

// ==========================================
// HR Settings
// ==========================================

export const useHRSettings = () => {
  return useQuery({
    queryKey: ["hr-settings"],
    queryFn: async () => {
      const response = await api.get("/api/v1/hr/settings/current/");
      return response.data;
    },
  });
};

export const useUpdateHRSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch("/api/v1/hr/settings/current/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-settings"] });
      queryClient.invalidateQueries({ queryKey: ["company-info"] });
    },
  });
};

// ==========================================
// Payroll Engine
// ==========================================

export const usePayComponents = () => {
  return useQuery({
    queryKey: ["pay-components"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payroll/components/");
      return response.data;
    },
  });
};

export const useCreatePayComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/payroll/components/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-components"] }),
  });
};

export const useUpdatePayComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.patch(`/api/v1/payroll/components/${id}/`, data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-components"] }),
  });
};

export const useDeletePayComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/api/v1/payroll/components/${id}/`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pay-components"] }),
  });
};

export const useStatutoryBrackets = () => {
  return useQuery({
    queryKey: ["statutory-brackets"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payroll/brackets/");
      return response.data;
    },
  });
};

export const useCreateStatutoryBracket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/payroll/brackets/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["statutory-brackets"], refetchType: "all" }),
  });
};

export const useEmployeePayComponents = () => {
  return useQuery({
    queryKey: ["employee-pay-components"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payroll/employee-structures/");
      return response.data;
    },
  });
};

export const useCreateEmployeePayComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/payroll/employee-structures/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["employee-pay-components"] }),
  });
};

export const usePayrollPeriods = () => {
  return useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payroll/periods/");
      return response.data;
    },
  });
};

export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post("/api/v1/payroll/periods/", data);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payroll-periods"] }),
  });
};

export const useCalculatePayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (periodId: number) => {
      const response = await api.post(`/api/v1/payroll/periods/${periodId}/calculate/`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payslips"] });
    },
  });
};

export const usePayslips = () => {
  return useQuery({
    queryKey: ["payslips"],
    queryFn: async () => {
      const response = await api.get("/api/v1/payroll/payslips/");
      return response.data;
    },
  });
};

export const useAuditTrail = (params: any = {}) => {
  return useQuery({
    queryKey: ["audit-trail", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/audit-trail/", { params });
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};


