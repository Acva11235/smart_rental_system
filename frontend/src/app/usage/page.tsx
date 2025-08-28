"use client";
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { UsageRow } from '@/lib/types';
import { toNum, relativeTimeFromIso } from '@/lib/format';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
const DynamicUsageMap = dynamic(() => import('@/components/UsageMap').then(m => m.UsageMap), { ssr: false });

export default function UsagePage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['usage'], queryFn: api.getUsage, refetchInterval: 30_000, staleTime: 10_000 });
  const [idleThreshold, setIdleThreshold] = useState<number>(50);
  const [utilStatus, setUtilStatus] = useState<string>('All');

  const enriched = (data || []).map((r) => ({
    ...r,
    location_lat: toNum(r.location_lat),
    location_lon: toNum(r.location_lon),
    idlePct: (() => {
      const p = toNum(r.productive_time_mins);
      const i = toNum(r.idle_time_mins);
      const d = p + i;
      return d === 0 ? 0 : (i / d) * 100;
    })(),
  }));

  const filtered = enriched.filter((r) => (utilStatus === 'All' || r.utilization_status === utilStatus) && r.idlePct >= idleThreshold);

  const columns: ColumnDef<UsageRow & { idlePct: number }>[] = useMemo(() => [
    { header: 'Machine', accessorKey: 'name' },
    { header: 'Time', cell: ({ row }) => relativeTimeFromIso(row.original.timestamp) },
    { header: 'Productive mins', accessorKey: 'productive_time_mins' },
    { header: 'Idle mins', accessorKey: 'idle_time_mins' },
    { header: 'Idle %', cell: ({ row }) => row.original.idlePct.toFixed(0) + '%' },
    { header: 'RPM var', accessorKey: 'rpm_variance' },
    { header: 'Overspeed', accessorKey: 'over_speed_events' },
    { header: 'Utilization Status', accessorKey: 'utilization_status' },
  ], []);

  const exportCsv = () => {
    const headers = ['Machine','Time','Productive mins','Idle mins','Idle %','RPM var','Overspeed','Utilization Status'];
    const rows = filtered.map(r => [
      r.name,
      r.timestamp,
      r.productive_time_mins,
      r.idle_time_mins,
      r.idlePct.toFixed(0),
      r.rpm_variance,
      r.over_speed_events,
      r.utilization_status,
    ]);
    const csv = [headers, ...rows].map(arr => arr.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {isLoading && <Loader/>}
      {error && <ErrorState error={error} retry={refetch}/>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium mb-2">Live Map</div>
          <DynamicUsageMap rows={enriched} />
        </div>
        <div>
          <div className="flex gap-4 items-center text-sm">
            <label className="flex items-center gap-2">Idle% ≥
              <input className="border px-2 py-1 rounded w-16" type="number" value={idleThreshold} onChange={(e) => setIdleThreshold(Number(e.target.value))} />
            </label>
            <label className="flex items-center gap-2">Utilization
              <select className="border px-2 py-1 rounded" value={utilStatus} onChange={(e) => setUtilStatus(e.target.value)}>
                <option>All</option>
                <option>Normal</option>
                <option>Underutilized</option>
                <option>Overutilized</option>
              </select>
            </label>
            <Button variant="outline" size="sm" onClick={exportCsv}>Export CSV</Button>
          </div>
          <div className="mt-3">
            <DataTable columns={columns} data={filtered} />
          </div>
        </div>
      </div>
    </div>
  );
}


