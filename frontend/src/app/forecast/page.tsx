"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, MapPin, Package, BarChart3 } from 'lucide-react';

export default function ForecastPage() {
  const { 
    data: forecastData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['forecast'],
    queryFn: api.getForecast
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Simple forecast data processing
  const chartData = forecastData?.map((item: any) => ({
    month: item.month,
    rentals: Number(item.rentals) || 0
  })) || [];

  // Generate equipment demand predictions (mock data for demo)
  const equipmentDemand = [
    { equipment: 'Excavator', current: 45, predicted: 62, site: 'Mumbai Construction' },
    { equipment: 'Crane', current: 23, predicted: 31, site: 'Delhi Metro Project' },
    { equipment: 'Bulldozer', current: 18, predicted: 24, site: 'Bangalore Highway' },
    { equipment: 'Loader', current: 34, predicted: 28, site: 'Chennai Port' },
    { equipment: 'Generator', current: 67, predicted: 78, site: 'Pune IT Park' },
    { equipment: 'Compactor', current: 12, predicted: 19, site: 'Hyderabad Airport' }
  ];

  const totalCurrent = equipmentDemand.reduce((sum, item) => sum + item.current, 0);
  const totalPredicted = equipmentDemand.reduce((sum, item) => sum + item.predicted, 0);
  const growthRate = totalCurrent > 0 ? ((totalPredicted - totalCurrent) / totalCurrent * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          <span className="uppercase tracking-wider text-xs">Forecasting</span>
        </div>
        <h1 className="text-3xl font-bold">Demand Forecasting</h1>
        <p className="text-muted-foreground">
          Help companies pre-position equipment by predicting which tools/machines will be needed at certain sites/times
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Demand</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrent}</div>
            <p className="text-xs text-muted-foreground">units across all sites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Demand</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPredicted}</div>
            <p className="text-xs text-muted-foreground">expected next period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">period over period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentDemand.length}</div>
            <p className="text-xs text-muted-foreground">monitored locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Rental Trends</CardTitle>
          <CardDescription>Monthly rental patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rentals" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Demand Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Demand Prediction</CardTitle>
          <CardDescription>Current vs predicted demand by equipment type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="equipment" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = equipmentDemand.find(item => item.equipment === label);
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium mb-2 text-gray-900">{label}</p>
                          <p className="text-sm text-gray-600">Site: {data?.site}</p>
                          <p className="text-sm text-gray-900">Current: {data?.current} units</p>
                          <p className="text-sm text-gray-900">Predicted: {data?.predicted} units</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="current" fill="#94a3b8" name="Current Demand" />
                <Bar dataKey="predicted" fill="#3b82f6" name="Predicted Demand" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Forecast Table */}
      <Card>
        <CardHeader>
          <CardTitle>Site-wise Equipment Forecast</CardTitle>
          <CardDescription>Detailed predictions and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Equipment Type</th>
                  <th className="text-left p-3 font-medium">Site Location</th>
                  <th className="text-left p-3 font-medium">Current</th>
                  <th className="text-left p-3 font-medium">Predicted</th>
                  <th className="text-left p-3 font-medium">Change</th>
                  <th className="text-left p-3 font-medium">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {equipmentDemand.map((item, index) => {
                  const change = item.predicted - item.current;
                  const changePercent = item.current > 0 ? (change / item.current * 100) : 0;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{item.equipment}</td>
                      <td className="p-3 text-muted-foreground">{item.site}</td>
                      <td className="p-3">{item.current} units</td>
                      <td className="p-3">{item.predicted} units</td>
                      <td className="p-3">
                        <span className={`font-medium ${
                          change > 0 ? 'text-green-600' : 
                          change < 0 ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {change > 0 ? '+' : ''}{change} ({changePercent.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={
                          change > 5 ? 'default' :
                          change < -5 ? 'destructive' :
                          'secondary'
                        }>
                          {change > 5 ? 'Increase Stock' : 
                           change < -5 ? 'Reduce Stock' : 
                           'Maintain Current'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Summary</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              <span className="text-sm">Overall equipment demand is expected to increase by {growthRate.toFixed(1)}%</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              <span className="text-sm">Excavators and Generators show highest growth potential</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              <span className="text-sm">Consider pre-positioning equipment at Mumbai and Pune sites</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
              <span className="text-sm">Monitor Chennai site for potential demand reduction</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}