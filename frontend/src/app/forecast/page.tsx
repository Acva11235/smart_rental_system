"use client";
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import Loader from '@/components/Loader';
import ErrorState from '@/components/ErrorState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, MapPin, Package, BarChart3, Bot, AlertCircle, CheckCircle } from 'lucide-react';

const equipmentTypes = [
  'Excavator', 'Bulldozer', 'Crane', 'Loader', 'Generator', 
  'Compactor', 'Grader', 'Backhoe', 'Forklift', 'Dump Truck'
];

export default function ForecastPage() {
  const { 
    data: forecastData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['forecast'],
    queryFn: api.getForecast
  });

  // Recommendations state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('1');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [currentRented, setCurrentRented] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [errorRec, setErrorRec] = useState<string>('');

  const handleGetRecommendations = async () => {
    if (!selectedAsset) {
      setErrorRec('Please select an asset type');
      return;
    }

    setLoadingRec(true);
    setErrorRec('');
    
    try {
      const result = await api.getRecommendations(
        selectedCompanyId,
        selectedAsset,
        currentRented
      );
      setRecommendations(result);
    } catch (err: any) {
      setErrorRec(err.message || 'Failed to get recommendations');
    } finally {
      setLoadingRec(false);
    }
  };

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

      {/* AI Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Get equipment recommendations for specific companies using machine learning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Company ID</label>
              <input
                type="text"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
                placeholder="Enter company ID..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Equipment Type</label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
              >
                <option value="">Select equipment...</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Current Rented</label>
              <input
                type="number"
                value={currentRented}
                onChange={(e) => setCurrentRented(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
                min="0"
              />
            </div>
          </div>

          {errorRec && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{errorRec}</span>
            </div>
          )}

          <Button 
            onClick={handleGetRecommendations}
            disabled={loadingRec || !selectedAsset || !selectedCompanyId}
            className="w-full md:w-auto"
          >
            {loadingRec ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Getting Recommendations...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Get AI Recommendations
              </>
            )}
          </Button>

          {/* Results */}
          {recommendations && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-lg font-semibold">Recommendation Results</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Input Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Company:</span> {selectedCompanyId}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Asset:</span> {selectedAsset}
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current:</span> {currentRented}
                    </div>
                  </CardContent>
                </Card>

                {recommendations.suggested_quantity && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Suggested Quantity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {recommendations.suggested_quantity}
                      </div>
                      <p className="text-xs text-muted-foreground">units recommended</p>
                    </CardContent>
                  </Card>
                )}

                {recommendations.confidence && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Confidence Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(recommendations.confidence * 100)}%
                      </div>
                      <p className="text-xs text-muted-foreground">prediction accuracy</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {recommendations.recommendation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">AI Recommendation</h5>
                      <p className="text-blue-800 mt-1">{recommendations.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw API Response for Debugging */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View Full API Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(recommendations, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}