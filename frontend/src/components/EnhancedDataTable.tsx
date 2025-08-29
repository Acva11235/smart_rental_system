"use client";
import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { AssetRow } from '@/lib/types';
import { formatMoney } from '@/lib/format';

interface EnhancedDataTableProps {
  assets: AssetRow[];
  onViewDetail?: (asset: AssetRow) => void;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'rented':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'under_maintenance':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatStatus = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function EnhancedDataTable({ assets, onViewDetail }: EnhancedDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [minRate, setMinRate] = useState<string>('');
  const [maxRate, setMaxRate] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredAssets = useMemo(() => {
    const min = minRate.trim() === '' ? -Infinity : Number(minRate);
    const max = maxRate.trim() === '' ? Infinity : Number(maxRate);
    return assets.filter(asset => {
      const matchesSearch =
        asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.machine_id.toString().includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter;
      const matchesMaker = manufacturerFilter === 'all' || asset.manufacturer === manufacturerFilter;

      const dayRate = Number(asset.rental_price_per_day || 0);
      const matchesRate = dayRate >= min && dayRate <= max;

      return matchesSearch && matchesStatus && matchesType && matchesMaker && matchesRate;
    });
  }, [assets, searchTerm, statusFilter, typeFilter, manufacturerFilter, minRate, maxRate]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(assets.map(a => a.status))), [assets]);
  const uniqueTypes = useMemo(() => Array.from(new Set(assets.map(a => a.asset_type))), [assets]);
  const uniqueManufacturers = useMemo(() => Array.from(new Set(assets.map(a => a.manufacturer))), [assets]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const visibleAssets = useMemo(() => filteredAssets.slice(pageStart, pageStart + pageSize), [filteredAssets, pageStart, pageSize]);

  // Reset to first page on filters change
  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, typeFilter, manufacturerFilter, minRate, maxRate, pageSize]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Fleet Assets</CardTitle>
            <CardDescription>
              Comprehensive overview of all fleet assets and their current status
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-100 border-gray-300 text-gray-900 focus:bg-gray-50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
            >
              <option value="all">All Status</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
            >
              <option value="all">All Manufacturers</option>
              {uniqueManufacturers.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Input placeholder="Min rate" value={minRate} onChange={(e) => setMinRate(e.target.value)} className="bg-gray-100 border-gray-300 text-gray-900 focus:bg-gray-50" />
            <span className="text-gray-400">-</span>
            <Input placeholder="Max rate" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} className="bg-gray-100 border-gray-300 text-gray-900 focus:bg-gray-50" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <div className="max-h-[480px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-semibold">Asset ID</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Manufacturer</TableHead>
                <TableHead className="font-semibold">Year</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Current Renter</TableHead>
                <TableHead className="font-semibold text-right">Rate/Day</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleAssets.map((asset, index) => (
                <TableRow key={`${asset.machine_id}-${index}`} className="hover:bg-gray-50/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      #{asset.machine_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium capitalize">
                      {asset.asset_type}
                    </div>
                  </TableCell>
                  <TableCell>{asset.manufacturer}</TableCell>
                  <TableCell>{asset.year_of_manufacture}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(asset.status)}>
                      {formatStatus(asset.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.currentRenter ? (
                      <span className="text-sm font-medium">{asset.currentRenter}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatMoney(Number(asset.rental_price_per_day))}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500">
                      {Number(asset.current_location_lat).toFixed(3)}, {Number(asset.current_location_lon).toFixed(3)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetail?.(asset)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 pt-4 text-sm text-gray-500">
          <div>
            Showing {visibleAssets.length} of {filteredAssets.length} filtered • Total {assets.length}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Rows:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-900"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
