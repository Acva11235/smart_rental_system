"use client";
import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import { UsageRow } from '@/lib/types';

interface RawMetricsTableProps {
  data: UsageRow[];
}

export function RawMetricsTable({ data }: RawMetricsTableProps) {
  const [search, setSearch] = useState('');

  const filteredData = data.filter(row => {
    const matchesSearch = search === '' || 
      (row.name && row.name.toLowerCase().includes(search.toLowerCase())) ||
      (row.machine_id && row.machine_id.toString().includes(search));
    return matchesSearch;
  });

  const exportToCSV = () => {
    const headers = [
      'Machine ID', 'Name', 'Status', 'Fuel Rate', 'Idle Fuel %', 'RPM Variance', 'Coolant Temp',
      'Productive Time', 'Idle Time', 'Vibration', 'Overload', 'Overspeed', 'Tire Pressure', 
      'Error Frequency', 'Battery Events'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.machine_id || '',
        row.name || '',
        row.utilization_status || '',
        row.avg_fuel_consumption_rate || '0',
        row.idle_fuel_consumption_pct || '0',
        row.rpm_variance || '0',
        row.coolant_temp_anomalies || '0',
        row.productive_time_mins || '0',
        row.idle_time_mins || '0',
        row.vibration_anomalies || '0',
        row.overload_cycles || '0',
        row.over_speed_events || '0',
        row.tire_pressure_deviations || '0',
        row.error_code_frequency || '0',
        row.battery_low_voltage_events || '0'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'raw_metrics_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Raw Metrics Analytics</h3>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search machines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-3 text-gray-300">Machine</th>
              <th className="text-left p-3 text-gray-300">Status</th>
              <th className="text-left p-3 text-blue-300">Fuel Rate</th>
              <th className="text-left p-3 text-blue-300">Idle %</th>
              <th className="text-left p-3 text-green-300">RPM</th>
              <th className="text-left p-3 text-green-300">Coolant</th>
              <th className="text-left p-3 text-purple-300">Prod Time</th>
              <th className="text-left p-3 text-purple-300">Idle Time</th>
              <th className="text-left p-3 text-orange-300">Vibration</th>
              <th className="text-left p-3 text-orange-300">Overload</th>
              <th className="text-left p-3 text-red-300">Speed</th>
              <th className="text-left p-3 text-red-300">Pressure</th>
              <th className="text-left p-3 text-yellow-300">Errors</th>
              <th className="text-left p-3 text-yellow-300">Battery</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.slice(0, 10).map((row, index) => (
              <tr key={`${row.machine_id}-${index}`} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                <td className="p-3">
                  <div className="text-white font-medium">#{row.machine_id}</div>
                  <div className="text-xs text-gray-400">{row.name}</div>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.utilization_status === 'Normal' ? 'bg-green-900 text-green-200' :
                    row.utilization_status === 'Underutilized' ? 'bg-yellow-900 text-yellow-200' :
                    row.utilization_status === 'Overutilized' ? 'bg-red-900 text-red-200' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {row.utilization_status || 'N/A'}
                  </span>
                </td>
                <td className="p-3 text-blue-300">{Number(row.avg_fuel_consumption_rate || 0).toFixed(1)}</td>
                <td className="p-3 text-blue-300">{Number(row.idle_fuel_consumption_pct || 0).toFixed(1)}%</td>
                <td className="p-3 text-green-300">{Number(row.rpm_variance || 0).toFixed(0)}</td>
                <td className="p-3 text-green-300">{Number(row.coolant_temp_anomalies || 0).toFixed(0)}</td>
                <td className="p-3 text-purple-300">{Number(row.productive_time_mins || 0).toFixed(0)}m</td>
                <td className="p-3 text-purple-300">{Number(row.idle_time_mins || 0).toFixed(0)}m</td>
                <td className="p-3 text-orange-300">{Number(row.vibration_anomalies || 0).toFixed(0)}</td>
                <td className="p-3 text-orange-300">{Number(row.overload_cycles || 0).toFixed(0)}</td>
                <td className="p-3 text-red-300">{Number(row.over_speed_events || 0).toFixed(0)}</td>
                <td className="p-3 text-red-300">{Number(row.tire_pressure_deviations || 0).toFixed(0)}</td>
                <td className="p-3 text-yellow-300">{Number(row.error_code_frequency || 0).toFixed(0)}</td>
                <td className="p-3 text-yellow-300">{Number(row.battery_low_voltage_events || 0).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Showing {Math.min(10, filteredData.length)} of {filteredData.length} machines
      </div>
    </div>
  );
}