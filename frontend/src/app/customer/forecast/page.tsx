"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const equipmentTypes = [
  'Excavator', 'Bulldozer', 'Crane', 'Loader', 'Generator', 
  'Compactor', 'Grader', 'Backhoe', 'Forklift', 'Dump Truck'
];

export default function CustomerForecastPage() {
  const { user } = useAuth();
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  const testConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('');
    
    try {
      // Test basic backend connection first
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      console.log('Testing connection to:', baseUrl);
      
      const response = await fetch(`${baseUrl}/api/assets`);
      if (response.ok) {
        setConnectionStatus('✅ Backend connection successful');
        
        // Now test recommendations endpoint specifically
        try {
          const recResponse = await fetch(`${baseUrl}/api/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              company_id: "1", 
              asset: "Excavator", 
              current_rented: 1 
            })
          });
          
          if (recResponse.ok) {
            setConnectionStatus('✅ Backend and Recommendations API both working');
          } else {
            const errorText = await recResponse.text();
            setConnectionStatus(`✅ Backend OK, ❌ Recommendations API failed: ${recResponse.status} - ${errorText}`);
          }
        } catch (recErr: any) {
          setConnectionStatus(`✅ Backend OK, ❌ Recommendations API error: ${recErr.message}`);
        }
      } else {
        setConnectionStatus(`❌ Backend connection failed: ${response.status}`);
      }
    } catch (err: any) {
      setConnectionStatus(`❌ Backend unreachable: ${err.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleGetRecommendations = async () => {
    if (!selectedAsset || !user?.company_id) {
      setError('Please select an asset type');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Making recommendation request with:', {
        company_id: user.company_id.toString(),
        asset: selectedAsset,
        current_rented: 1
      });

      const result = await api.getRecommendations(
        user.company_id.toString(),
        selectedAsset,
        1 // Default current rented - you can make this dynamic based on user's actual rentals
      );
      
      console.log('Recommendation result:', result);
      setRecommendations(result);
    } catch (err: any) {
      console.error('Recommendation error:', err);
      setError(`Error: ${err.message || 'Failed to get recommendations'}. Status: ${err.status || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <BarChart3 className="h-5 w-5" />
          <span className="uppercase tracking-wider text-xs">Demand Forecasting</span>
        </div>
        <h1 className="text-3xl font-bold">Equipment Recommendations</h1>
        <p className="text-muted-foreground">
          Get AI-powered recommendations for your equipment needs
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Get Equipment Recommendations</CardTitle>
          <CardDescription>
            Select the equipment type you're interested in to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Equipment Type</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-50"
            >
              <option value="">Select equipment type...</option>
              {equipmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-700 text-sm font-medium">Request Failed</span>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                  Debug Information
                </summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                  <p><strong>User Company ID:</strong> {user?.company_id || 'Not available'}</p>
                  <p><strong>Selected Asset:</strong> {selectedAsset || 'Not selected'}</p>
                  <p><strong>API Endpoint:</strong> /api/recommendations</p>
                  <p><strong>Expected Request Body:</strong></p>
                  <pre className="mt-1 text-xs">
{JSON.stringify({
  company_id: user?.company_id?.toString() || 'N/A',
  asset: selectedAsset || 'N/A',
  current_rented: 1
}, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGetRecommendations}
              disabled={loading || !selectedAsset}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Getting Recommendations...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>

            <Button 
              onClick={testConnection}
              disabled={testingConnection}
              variant="outline"
              className="sm:w-auto"
            >
              {testingConnection ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
          </div>

          {connectionStatus && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm">{connectionStatus}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations for {selectedAsset}</CardTitle>
            <CardDescription>
              Based on your company profile and current rental patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display the raw response in a structured way */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Company ID</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.company_id}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Asset Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{selectedAsset}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Current Rentals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">active rental</p>
                </CardContent>
              </Card>
            </div>

            {/* API Response Display */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">AI Recommendations</h4>
              
              {/* Check if recommendations has expected structure */}
              {recommendations.recommendation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">Recommendation</h5>
                      <p className="text-blue-800 mt-1">{recommendations.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {recommendations.suggested_quantity && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              )}

              {/* Raw Response for Debugging */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  View Full API Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(recommendations, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <p className="text-sm">Our AI analyzes your company's rental history and industry patterns</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <p className="text-sm">Recommendations are based on similar companies in your industry and region</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <p className="text-sm">The system considers seasonal trends and project requirements</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <p className="text-sm">Higher confidence scores indicate more reliable predictions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
