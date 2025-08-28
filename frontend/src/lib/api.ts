import { AssetsResponse, HealthRow, MachineDetail, UsageRow, ForecastRow, CustomerRow, ApiError } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

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
  getForecast: () => http<ForecastRow[]>('/api/forecast'),
  getCustomers: () => http<CustomerRow[]>('/api/customers'),
};


