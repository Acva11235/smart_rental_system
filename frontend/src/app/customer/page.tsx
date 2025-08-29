"use client";
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useCustomerRealTime } from '@/hooks/useRealTimeData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { 
  Building2, 
  TrendingUp, 
  CreditCard, 
  Truck, 
  Calendar,
  MapPin,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Enable real-time data updates
  useCustomerRealTime(user?.company_id);

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['customerDashboard', user?.company_id],
    queryFn: () => user?.company_id ? api.getCustomerDashboard(user.company_id) : null,
    enabled: !!user?.company_id,
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !dashboardData) {
    return <ErrorState error={error || new Error("Failed to load dashboard data")} />;
  }

  // Prepare chart data
  const contractData = Object.entries(dashboardData.contractSummary).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
  }));

  const pieColors = ['#10b981', '#f59e0b', '#ef4444'];

  const machineTypes = dashboardData.activeMachines.reduce((acc: any, machine) => {
    acc[machine.asset_type] = (acc[machine.asset_type] || 0) + 1;
    return acc;
  }, {});

  const machineChartData = Object.entries(machineTypes).map(([type, count]) => ({
    type,
    count
  }));

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <User className="h-5 w-5" />
          <span className="uppercase tracking-wider text-xs">Customer Portal</span>
        </div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.username}!</h1>
        <p className="text-muted-foreground">
          {dashboardData.companyInfo.name} • {dashboardData.companyInfo.industry}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Machines</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeMachineCount}</div>
            <p className="text-xs text-muted-foreground">equipment on rent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.contractSummary.active}</div>
            <p className="text-xs text-muted-foreground">ongoing agreements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.financials.totalBilledAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.financials.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">invoices due</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Status</CardTitle>
            <CardDescription>Distribution of your contract statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contractData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {contractData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center flex-wrap gap-4 mt-4">
              {contractData.map((entry, index) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Machine Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Active Equipment Types</CardTitle>
            <CardDescription>Breakdown of equipment currently on rent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={machineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
          <CardDescription>Your company details and profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Industry</div>
              <div className="font-medium">{dashboardData.companyInfo.industry}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">State</div>
              <div className="font-medium">{dashboardData.companyInfo.state}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Segment</div>
              <div className="font-medium">{dashboardData.companyInfo.segment}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Address</div>
              <div className="font-medium">{dashboardData.companyInfo.address}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Active Equipment
          </CardTitle>
          <CardDescription>
            {dashboardData.activeMachines.length} equipment currently on rent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.activeMachines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Machine ID</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Manufacturer</th>
                    <th className="text-left p-3 font-medium">Contract End Date</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.activeMachines.map((machine) => {
                    const endDate = new Date(machine.end_date);
                    const daysLeft = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysLeft <= 7;
                    
                    return (
                      <tr key={machine.machine_id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">#{machine.machine_id}</td>
                        <td className="p-3 text-muted-foreground">{machine.asset_type}</td>
                        <td className="p-3 text-muted-foreground">{machine.manufacturer}</td>
                        <td className="p-3 text-muted-foreground">
                          {endDate.toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          {isExpiringSoon ? (
                            <Badge variant="destructive">
                              Expires in {daysLeft} days
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              Active
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active equipment rentals</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}