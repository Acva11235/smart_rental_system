"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import { KpiCard } from "@/components/KpiCard";
import { Donut } from "@/components/Donut";
import dynamic from "next/dynamic";
import { toNum, formatNumber } from "@/lib/format";

export default function Home() {
  const FleetMap = dynamic(() => import("@/components/Map").then(m => m.FleetMap), { ssr: false });
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ["assets"], queryFn: api.getAssets, staleTime: 30_000 });
  const { data: health } = useQuery({ queryKey: ["health"], queryFn: api.getHealth, staleTime: 30_000 });

  if (isLoading) return <Loader/>;
  if (error) return <ErrorState error={error} retry={refetch}/>;
  if (!data) return null;

  const kpis = [
    { title: "Total fleet", value: formatNumber(data.summary.total) },
    { title: "Rented", value: formatNumber(data.summary.rented) },
    { title: "Available", value: formatNumber(data.summary.available) },
    { title: "Rented %", value: `${toNum(data.summary.rentedPercentage).toFixed(0)}%` },
    { title: "Categories", value: Object.keys(data.categoryDistribution).length.toString() }
  ];

  const donutData = Object.entries(data.categoryDistribution).map(([name, value]) => ({ name, value }));
  const assets = data.assets.map((a) => ({ ...a, current_location_lat: toNum(a.current_location_lat), current_location_lon: toNum(a.current_location_lon) }));

  const risky = (health || [])
    .map(h => ({ ...h, downtime_risk_pct: toNum(h.downtime_risk_pct) }))
    .sort((a,b) => toNum(b.downtime_risk_pct) - toNum(a.downtime_risk_pct))
    .slice(0,6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map(k => <KpiCard key={k.title} title={k.title} value={k.value}/>) }
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold mb-2">Category Distribution</h2>
          <Donut data={donutData} />
        </div>
        <div>
          <h2 className="text-sm font-semibold mb-2">Fleet Map</h2>
          <FleetMap assets={assets} />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold mb-3">Riskiest Machines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {risky.map(r => (
            <div key={r.machine_id} className="rounded border p-3 text-sm">
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.manufacturer}</div>
              <div className="mt-1 text-red-600 dark:text-red-500">Risk {toNum(r.downtime_risk_pct).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
