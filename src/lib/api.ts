import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
console.log("[API] Using baseURL:", baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: Attach Bearer token
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("fahari-token") : null;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log all requests in development
  if (import.meta.env.DEV) {
    const logData = { ...config.data };
    const sensitiveKeys = ["password", "password_confirm", "email", "username", "token"];
    sensitiveKeys.forEach((key) => {
      if (logData[key]) logData[key] = "[REDACTED]";
    });
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, logData);
  }

  return config;
});

export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("fahari-token");
    localStorage.removeItem("fahari-refresh");
    localStorage.removeItem("fahari-user");
  }
};

// Response interceptor: Handle expired sessions
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log all errors in development
    if (import.meta.env.DEV) {
      const logData = error.config?.data ? JSON.parse(JSON.stringify(error.config.data)) : {};
      const sensitiveKeys = ["password", "password_confirm", "email", "username", "token"];

      // Handle both string and object data
      const dataObj = typeof logData === "string" ? JSON.parse(logData) : logData;
      sensitiveKeys.forEach((key) => {
        if (dataObj[key]) dataObj[key] = "[REDACTED]";
      });

      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        configData: dataObj,
        message: error.message,
      });
    }

    // If we get a 401 and we're not already on the login page
    if (error.response?.status === 401 && !window.location.pathname.includes("/login")) {
      const token = localStorage.getItem("fahari-token");
      // Only logout if we actually have a token that is now being rejected
      if (token) {
        console.warn("Session expired or invalid token. Redirecting to login...");
        clearAuthData();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
