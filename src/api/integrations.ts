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
  // M-Pesa
  getMpesaConfig: () => api.get<MpesaConfig[]>("/api/v1/integrations/mpesa/"),
  saveMpesaConfig: (data: MpesaConfig) =>
    data.id
      ? api.put(`/api/v1/integrations/mpesa/${data.id}/`, data)
      : api.post("/api/v1/integrations/mpesa/", data),

  // Bank
  getBankConfigs: () => api.get<BankConfig[]>("/api/v1/integrations/bank/"),
  saveBankConfig: (data: BankConfig) =>
    data.id
      ? api.put(`/api/v1/integrations/bank/${data.id}/`, data)
      : api.post("/api/v1/integrations/bank/", data),

  // eTIMS
  getEtimsConfig: () => api.get<EtimsConfig[]>("/api/v1/integrations/etims/"),
  saveEtimsConfig: (data: EtimsConfig) =>
    data.id
      ? api.put(`/api/v1/integrations/etims/${data.id}/`, data)
      : api.post("/api/v1/integrations/etims/", data),
};
