"use client";
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { CustomerRow } from '@/lib/types';
import { toNum } from '@/lib/format';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CustomersPage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['customers'], queryFn: api.getCustomers, staleTime: 30_000 });
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [stateFilter, setStateFilter] = useState<string>('All');

  const enriched: (CustomerRow & { sustainability_score: number; onTimeReturnRate: number; avgWearIndex: number })[] = (data || []).map((c) => ({
    ...c,
    sustainability_score: toNum(c.sustainability_score),
    onTimeReturnRate: toNum(c.onTimeReturnRate),
    avgWearIndex: toNum(c.avgWearIndex),
  }));

  const filtered = enriched.filter(c =>
    (industryFilter === 'All' || c.industry === industryFilter) &&
    (stateFilter === 'All' || c.state === stateFilter)
  );

  const columns: ColumnDef<(typeof enriched)[number]>[] = useMemo(() => [
    { header: 'Company', accessorKey: 'name' },
    { header: 'Industry', accessorKey: 'industry' },
    { header: 'State', accessorKey: 'state' },
    { header: 'Segment', accessorKey: 'segment' },
    { header: 'Sustainability', accessorKey: 'sustainability_score' },
    { header: 'Total Rentals', accessorKey: 'totalRentals' },
    { header: 'On-Time %', accessorKey: 'onTimeReturnRate' },
    { header: 'Avg Safety', accessorKey: 'avgSafetyScore' },
    { header: 'Avg Wear', accessorKey: 'avgWearIndex' },
    // { header: 'Badges', cell: ({ row }) => (
    //   <div className="flex gap-2">
    //     {isPartner(row.original) && <Badge variant="secondary">Green Partner</Badge>}
    //     {isRisky(row.original) && <Badge variant="destructive">Risky</Badge>}
    //   </div>
    // ) },
  ], [/* no deps */]);

  const industries = Array.from(new Set(enriched.map(c => c.industry)));
  const states = Array.from(new Set(enriched.map(c => c.state)));

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      {isLoading && <Loader/>}
      {error && <ErrorState error={error} retry={refetch}/>}      

      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Users className="h-5 w-5" />
          <span className="uppercase tracking-wider text-xs">Customers</span>
        </div>
        <h1 className="text-3xl font-bold">Customer Directory</h1>
        <p className="text-muted-foreground">Browse and filter your customer base with clean, focused UI</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Refine results by industry and state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="block mb-2 text-muted-foreground">Industry</span>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
                value={industryFilter}
                onChange={(e)=>setIndustryFilter(e.target.value)}
              >
                <option>All</option>
                {industries.map(i => <option key={i}>{i}</option>)}
              </select>
            </label>
            <label className="text-sm">
              <span className="block mb-2 text-muted-foreground">State</span>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
                value={stateFilter}
                onChange={(e)=>setStateFilter(e.target.value)}
              >
                <option>All</option>
                {states.map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Results</CardTitle>
          <CardDescription>{filtered.length} of {enriched.length} customers shown</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}


