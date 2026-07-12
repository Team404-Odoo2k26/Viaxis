async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const fetchDashboardStats = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<any>(`/api/dashboard${qs}`);
};

export const fetchVehicles = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<any>(`/api/vehicles${qs}`);
};

export const createVehicle = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/vehicles", { method: "POST", body: JSON.stringify(payload) });

export const updateVehicle = (id: number, payload: Record<string, unknown>) =>
  apiRequest<any>(`/api/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const fetchDrivers = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiRequest<any>(`/api/drivers${qs}`);
};

export const createDriver = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/drivers", { method: "POST", body: JSON.stringify(payload) });

export const updateDriver = (id: number, payload: Record<string, unknown>) =>
  apiRequest<any>(`/api/drivers/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const fetchTrips = () => apiRequest<any>("/api/trips");

export const createTrip = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/trips", { method: "POST", body: JSON.stringify(payload) });

export const updateTrip = (id: number, payload: Record<string, unknown>) =>
  apiRequest<any>(`/api/trips/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const fetchMaintenance = () => apiRequest<any>("/api/maintenance");

export const createMaintenance = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/maintenance", { method: "POST", body: JSON.stringify(payload) });

export const updateMaintenance = (id: number, payload: Record<string, unknown>) =>
  apiRequest<any>(`/api/maintenance/${id}`, { method: "PATCH", body: JSON.stringify(payload) });

export const fetchFuelLogs = () => apiRequest<any>("/api/fuel");

export const createFuelLog = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/fuel", { method: "POST", body: JSON.stringify(payload) });

export const fetchExpenses = () => apiRequest<any>("/api/expenses");

export const createExpense = (payload: Record<string, unknown>) =>
  apiRequest<any>("/api/expenses", { method: "POST", body: JSON.stringify(payload) });

export const fetchAnalytics = () => apiRequest<any>("/api/analytics");

export const fetchSettings = () => apiRequest<any>("/api/settings");

export const updateSettings = (payload: Record<string, unknown>) =>
  apiRequest<any>(`/api/settings`, { method: "PATCH", body: JSON.stringify(payload) });

export const login = (payload: { email: string; password: string; role: string }) =>
  apiRequest<any>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
