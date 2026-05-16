import { api } from "@/lib/api";

export interface MpesaConfig {
  id?: number;
  shortcode: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  initiator_name?: string;
  security_credential?: string;
  callback_url?: string;
  is_active: boolean;
  is_sandbox: boolean;
}

export interface BankConfig {
  id?: number;
  gateway_name: string;
  merchant_id: string;
  api_key: string;
  api_secret?: string;
  is_active: boolean;
  is_sandbox: boolean;
}

export interface EtimsConfig {
  id?: number;
  kra_pin: string;
  serial_number: string;
  api_key: string;
  endpoint_url: string;
  is_active: boolean;
  is_sandbox: boolean;
}

export const integrationsApi = {
  // M-Pesa Transactions
  getMpesaTransactions: () => api.get<any[]>("/api/v2/integrations/mpesa-transactions/"),
  initiateStkPush: (data: { phone: string; amount: number; sale_id?: number; session_id?: number }) =>
    api.post("/api/v2/mpesa/stk-push/", data),

  // M-Pesa Config
  getMpesaConfig: () => api.get<MpesaConfig[]>("/api/v2/integrations/mpesa-config/"),
  saveMpesaConfig: (data: MpesaConfig) =>
    data.id
      ? api.put(`/api/v2/integrations/mpesa-config/${data.id}/`, data)
      : api.post("/api/v2/integrations/mpesa-config/", data),

  // Bank
  getBankConfigs: () => api.get<BankConfig[]>("/api/v2/integrations/bank-config/"),
  saveBankConfig: (data: BankConfig) =>
    data.id
      ? api.put(`/api/v2/integrations/bank-config/${data.id}/`, data)
      : api.post("/api/v2/integrations/bank-config/", data),

  // eTIMS
  getEtimsConfig: () => api.get<EtimsConfig[]>("/api/v2/integrations/etims-config/"),
  saveEtimsConfig: (data: EtimsConfig) =>
    data.id
      ? api.put(`/api/v2/integrations/etims-config/${data.id}/`, data)
      : api.post("/api/v2/integrations/etims-config/", data),
};
