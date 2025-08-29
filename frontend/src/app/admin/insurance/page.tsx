"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Calculator, TrendingUp, DollarSign, FileText, AlertTriangle } from 'lucide-react';

export default function InsurancePricingPage() {
  const { user } = useAuth();
  const [machines, setMachines] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyId: '',
    assetType: '',
    quantity: '',
    rentalDays: ''
  });

  useEffect(() => {
    fetchMachines();
    fetchCompanies();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const data = await api.getInsuranceMachines();
      setMachines(data);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleCalculate = async () => {
    if (!formData.companyId || !formData.assetType || !formData.quantity || !formData.rentalDays) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCalculating(true);
      const pricing = await api.calculateInsurance(
        parseInt(formData.companyId),
        formData.assetType,
        parseInt(formData.quantity),
        parseInt(formData.rentalDays)
      );
      setResult(pricing);
    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Failed to calculate insurance pricing');
    } finally {
      setCalculating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="mx-auto max-w-6xl py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-primary">
          <Shield className="h-5 w-5" />
          <span className="uppercase tracking-wider text-xs">Insurance Pricing</span>
        </div>
        <h1 className="text-3xl font-bold">Equipment Insurance Calculator</h1>
        <p className="text-muted-foreground">
          Calculate insurance premiums based on equipment type, company segment, and sustainability score
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Insurance Calculation Form
            </CardTitle>
            <CardDescription>
              Enter the details below to calculate insurance pricing with our proprietary algorithm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Selection */}
            <div className="space-y-2">
              <Label htmlFor="company">Select Company</Label>
              <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a company..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.company_id} value={company.company_id.toString()}>
                      {company.name} - {company.segment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Asset Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="assetType">Equipment Type</Label>
              <Select value={formData.assetType} onValueChange={(value) => handleInputChange('assetType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose equipment type..." />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((machine) => (
                    <SelectItem key={machine.asset_type} value={machine.asset_type}>
                      {machine.asset_type} - ${machine.avg_daily_rate}/day ({machine.available_count} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Number of machines"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
              />
            </div>

            {/* Rental Days */}
            <div className="space-y-2">
              <Label htmlFor="rentalDays">Rental Period (Days)</Label>
              <Input
                id="rentalDays"
                type="number"
                min="1"
                placeholder="Number of days"
                value={formData.rentalDays}
                onChange={(e) => handleInputChange('rentalDays', e.target.value)}
              />
            </div>

            {/* Calculate Button */}
            <Button 
              onClick={handleCalculate} 
              disabled={calculating || loading}
              className="w-full"
              size="lg"
            >
              {calculating ? 'Calculating...' : 'Calculate Insurance Premium'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              {/* Company & Machine Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Calculation Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Company Segment:</span>
                      <Badge variant="outline" className="ml-2">
                        {result.company.segment}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Sustainability Score:</span>
                      <Badge variant="secondary" className="ml-2">
                        {result.company.sustainabilityScore}%
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Equipment Type:</span>
                      <span className="ml-2">{result.machine.type}</span>
                    </div>
                    <div>
                      <span className="font-medium">Quantity:</span>
                      <span className="ml-2">{result.machine.quantity} units</span>
                    </div>
                    <div>
                      <span className="font-medium">Rental Period:</span>
                      <span className="ml-2">{result.machine.rentalDays} days</span>
                    </div>
                    <div>
                      <span className="font-medium">Utilization Score:</span>
                      <Badge variant="outline" className="ml-2">
                        {result.machine.utilizationScore.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Price Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <span className="font-medium">Base Rental Cost</span>
                      <span className="text-lg font-bold">${result.breakdown.baseRental}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Insurance Premium</span>
                      <span className="text-lg font-bold text-blue-600">${result.breakdown.insuranceCoverage}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border-2 border-green-200">
                      <span className="font-bold text-lg">Grand Total</span>
                      <span className="text-2xl font-bold text-green-600">${result.breakdown.grandTotal}</span>
                    </div>
                  </div>

                  {/* Per Machine Breakdown */}
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Per Machine Calculation:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Base Price/Day:</span>
                        <div className="font-medium">${result.calculation.basePricePerMachinePerDay}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Insurance/Machine:</span>
                        <div className="font-medium">${result.calculation.insurancePremiumPerMachine}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">
                        Premium calculated based on company segment, sustainability practices, and equipment utilization patterns
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Higher sustainability scores and better company segments receive favorable pricing
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill out the form to calculate insurance premium
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
