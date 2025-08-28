import { AssetsResponse, HealthRow, MachineDetail, UsageRow, ForecastRow, CustomerRow, DashboardAnalytics, UsageAnalytics, AdvancedForecastData, ApiError } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { ...init, cache: 'no-store' });
  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = (await res.json()) as ApiError;
      message = data?.message || message;
    } catch {
      // ignore
    }
    const err = new Error(message) as Error & { status?: number };
    (err as { status?: number }).status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  getAssets: () => http<AssetsResponse>('/api/assets'),
  getHealth: () => http<HealthRow[]>('/api/health'),
  getMachineDetail: (machineId: number | string) => http<MachineDetail>(`/api/health/${machineId}`),
  getUsage: () => http<UsageRow[]>('/api/usage'),
  getUsageAnalytics: () => http<UsageAnalytics>('/api/usage/analytics'),
  getForecast: () => http<ForecastRow[]>('/api/forecast'),
  getAdvancedForecast: () => http<AdvancedForecastData>('/api/forecast/advanced'),
  getCustomers: () => http<CustomerRow[]>('/api/customers'),
  getDashboardAnalytics: () => http<DashboardAnalytics>('/api/dashboard/analytics'),
};


