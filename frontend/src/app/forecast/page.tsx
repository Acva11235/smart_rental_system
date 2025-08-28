"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toNum, formatNumber } from '@/lib/format';

export default function ForecastPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['forecast'], queryFn: api.getForecast, staleTime: 30_000 });
  if (isLoading) return <Loader/>;
  if (error) return <ErrorState error={error} retry={refetch}/>;
  if (!data) return null;

  const series = data.map(d => ({ ...d, rentals: toNum(d.rentals) }));
  const last3 = series.slice(-3).reduce((s, r) => s + r.rentals, 0) / Math.max(1, Math.min(3, series.length));
  const mom = series.length >= 2 ? series[series.length - 1].rentals - series[series.length - 2].rentals : 0;

  const projection = (() => {
    const n = series.length;
    if (n < 2) return [] as { month: string; rentals: number; projected: number }[];
    const last = series[n - 1].rentals;
    const prev = series[n - 2].rentals;
    const slope = last - prev;
    const proj1 = last + slope;
    const proj2 = proj1 + slope;
    return [
      { month: 'Next 1', rentals: last, projected: proj1 },
      { month: 'Next 2', rentals: proj1, projected: proj2 },
    ];
  })();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">Last 3 months avg</div>
          <div className="text-2xl font-semibold">{formatNumber(last3, 0)}</div>
        </div>
        <div className="rounded border p-3">
          <div className="text-xs text-muted-foreground">MoM delta</div>
          <div className="text-2xl font-semibold">{formatNumber(mom, 0)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm font-medium mb-2">Rentals per month</div>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <BarChart data={series}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="rentals" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2">Projection (2 months)</div>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <LineChart data={[...series, ...projection]}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rentals" stroke="#3b82f6" dot={false} />
                <Line type="monotone" dataKey="projected" stroke="#9ca3af" strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


