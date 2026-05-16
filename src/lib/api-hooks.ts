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
  image?: string;
  cost_price: number;
  markup_percentage: number;
  stock_levels?: any[];
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
      const { data } = await api.get(`/api/products/${productId}/batches/available/`);
      return data;
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
export const useTransfers = () => {
  return useQuery({
    queryKey: ["transfers"],
    queryFn: async () => {
      const response = await api.get("/api/v1/transfers/");
      return response.data;
    },
  });
};

export const useMovements = () => {
  return useQuery({
    queryKey: ["movements"],
    queryFn: async () => {
      const response = await api.get("/api/v1/movements/");
      return response.data;
    },
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

export const useCategories = () => {
  return useQuery<{ results: any[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/categories/");
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
      const response = await api.post("/api/v1/settings/inventory/", data);
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

export const useTables = () => {
  return useQuery<{ results: Table[] }>({
    queryKey: ["tables"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/restaurant/tables/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
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
      return data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for live updates
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
      const { data } = await api.get("/api/v1/shifts/current/");
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useActiveSession = (tableNumber: string) => {
  return useQuery({
    queryKey: ["active-session", tableNumber],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/restaurant/sessions/", {
        params: { table_number: tableNumber, status: "active" },
      });
      return data.results?.[0] || null;
    },
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("fahari-token") && !!tableNumber,
    refetchInterval: 10000, // Refresh every 10 seconds to keep KDS sync
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
      const { data } = await api.post("/api/v1/shifts/start_shift/", {
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
      return data.results || [];
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useEndShift = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ shiftId, blindCash }: { shiftId: string; blindCash: number }) => {
      const { data } = await api.post(`/api/v1/shifts/${shiftId}/end_shift/`, {
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
        `/api/v1/restaurant/sessions/${sessionId}/checkout/`,
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

export const useReports = (params?: { type: string }) => {
  return useQuery({
    queryKey: ["reports", params],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/reports/", { params });
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useMovementAnalytics = () => {
  return useQuery({
    queryKey: ["movement-analytics"],
    queryFn: async () => {
      const response = await api.get("/api/v1/movements/analytics/");
      return response.data;
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
      const { data } = await api.get("/api/v1/debt-payments/", { params });
      return data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("fahari-token"),
  });
};

export const useRecordDebtPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { customer: number; amount: number; payment_method: string; reference_number?: string; notes?: string }) => {
      const response = await api.post("/api/v1/debt-payments/", data);
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
      const { data } = await api.get("/api/v1/loyalty-transactions/", { params });
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
