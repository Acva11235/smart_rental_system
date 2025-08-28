"use client";
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { HealthRow } from '@/lib/types';
import Link from 'next/link';
import { toNum, formatNumber } from '@/lib/format';
import { Gauge } from '@/components/Gauge';

export default function HealthPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['health'], queryFn: api.getHealth, staleTime: 30_000 });

  const rows = ((data || []) as HealthRow[]).sort((a,b) => toNum(b.downtime_risk_pct) - toNum(a.downtime_risk_pct));

  const avg = (key: keyof HealthRow) => rows.reduce((s,r) => s + toNum(r[key] as unknown as number), 0) / Math.max(1, rows.length);
  const avgFuel = avg('fuel_efficiency_score');
  const avgUtil = avg('utilization_ratio');
  const avgSafety = avg('safety_score');

  const columns: ColumnDef<HealthRow>[] = useMemo(() => [
    { header: 'Machine', cell: ({ row }) => <Link href={`/health/${row.original.machine_id}`} className="underline">{row.original.name}</Link> },
    { header: 'Manufacturer', accessorKey: 'manufacturer' },
    { header: 'FuelEfficiency', cell: ({ row }) => formatNumber(row.original.fuel_efficiency_score, 1) },
    { header: 'EngineStability', cell: ({ row }) => formatNumber(row.original.engine_stability_score, 1) },
    { header: 'Utilization%', cell: ({ row }) => `${formatNumber(row.original.utilization_ratio, 0)}%` },
    { header: 'Wear&Tear', cell: ({ row }) => formatNumber(row.original.wear_and_tear_index, 0) },
    { header: 'Safety', cell: ({ row }) => formatNumber(row.original.safety_score, 0) },
    { header: 'DowntimeRisk%', cell: ({ row }) => `${formatNumber(row.original.downtime_risk_pct, 0)}%` },
  ], []);

  return (
    <div className="space-y-6">
      {isLoading && <Loader/>}
      {error && <ErrorState error={error} retry={refetch}/>}        
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Gauge value={avgFuel} label="Avg Fuel Efficiency" />
        <Gauge value={avgUtil} label="Avg Utilization" />
        <Gauge value={avgSafety} label="Avg Safety" />
      </div>
      <DataTable columns={columns} data={rows} />
    </div>
  );
}


