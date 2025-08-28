// Shared TypeScript interfaces for the Smart Rental Tracking System frontend

export type MachineStatus = 'available' | 'rented' | 'under_maintenance' | 'decommissioned';

export type AssetRow = {
  machine_id: number;
  asset_type: string;
  manufacturer: string;
  year_of_manufacture: number;
  current_location_lat: number;
  current_location_lon: number;
  status: MachineStatus;
  rental_price_per_hour: number | string;
  rental_price_per_day: number | string;
  rentalStatus: string;
  currentRenter: string | null;
};

export type AssetsResponse = {
  assets: AssetRow[];
  summary: { total: number; rented: number; available: number; rentedPercentage: number };
  categoryDistribution: Record<string, number>;
};

export type HealthRow = {
  machine_id: number;
  name: string;
  manufacturer: string;
  log_timestamp: string;
  fuel_efficiency_score: number | string;
  engine_stability_score: number | string;
  utilization_ratio: number | string;
  wear_and_tear_index: number | string;
  safety_score: number | string;
  downtime_risk_pct: number | string;
};

export type SensorReading = {
  timestamp: string;
  avg_fuel_consumption_rate: number | string;
  idle_fuel_consumption_pct: number | string;
  rpm_variance: number | string;
  coolant_temp_anomalies: number | string;
  productive_time_mins: number | string;
  idle_time_mins: number | string;
  vibration_anomalies: number | string;
  overload_cycles: number | string;
  over_speed_events: number | string;
  tire_pressure_deviations: number | string;
  error_code_frequency: number | string;
  battery_low_voltage_events: number | string;
};

export type MachineDetail = {
  machine: AssetRow;
  sensorReadings: SensorReading[];
};

export type UsageRow = {
  machine_id: number;
  name: string;
  location_lat: number | string;
  location_lon: number | string;
  timestamp: string;
  productive_time_mins: number | string;
  idle_time_mins: number | string;
  avg_fuel_consumption_rate: number | string;
  idle_fuel_consumption_pct: number | string;
  rpm_variance: number | string;
  coolant_temp_anomalies: number | string;
  vibration_anomalies: number | string;
  overload_cycles: number | string;
  over_speed_events: number | string;
  tire_pressure_deviations: number | string;
  error_code_frequency: number | string;
  battery_low_voltage_events: number | string;
  utilization_status: 'Normal' | 'Underutilized' | 'Overutilized';
};

export type ForecastRow = { month: string; rentals: number | string };

export type CustomerRow = {
  company_id: number;
  name: string;
  industry: string;
  address: string;
  location_lat: number | string;
  location_lon: number | string;
  state: string;
  segment: string;
  sustainability_score: number | string;
  totalRentals: number | string;
  onTimeReturnRate: number | string;
  avgSafetyScore: number | string;
  avgWearIndex: number | string;
};

export type ApiError = { message: string; status?: number };


