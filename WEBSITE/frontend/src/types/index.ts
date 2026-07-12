export type Role =
  | "Fleet Manager"
  | "Dispatcher"
  | "Safety Officer"
  | "Financial Analyst";

export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
export type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
export type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
export type MaintenanceStatus = "Active" | "Completed";
export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Vehicle {
  id: number;
  registration_no: string;
  name_model: string;
  type: string;
  capacity_kg: number;
  odometer: number;
  acquisition_cost: number;
  status: VehicleStatus;
  region: string | null;
}

export interface Driver {
  id: number;
  name: string;
  license_no: string;
  license_category: string;
  license_expiry: string;
  contact: string | null;
  trip_completion_pct: number;
  safety_score: number;
  status: DriverStatus;
}

export interface Trip {
  id: number;
  source: string;
  destination: string;
  vehicle_id: number | null;
  driver_id: number | null;
  cargo_weight_kg: number | null;
  planned_distance_km: number | null;
  final_odometer: number | null;
  fuel_consumed_liters: number | null;
  status: TripStatus;
  eta: string | null;
  notes: string | null;
  revenue: number;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  service_type: string;
  cost: number;
  service_date: string;
  status: MaintenanceStatus;
  notes: string | null;
  vehicle?: Vehicle;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  log_date: string;
  liters: number;
  cost: number;
  vehicle?: Vehicle;
}

export interface Expense {
  id: number;
  trip_id: number | null;
  vehicle_id: number | null;
  toll: number;
  other: number;
  linked_maintenance_cost: number;
  total?: number;
  status: ExpenseStatus;
  notes: string | null;
}

export interface AppSettings {
  id: number;
  depot_name: string;
  currency: string;
  distance_unit: string;
}

export interface DashboardStats {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization: number;
  vehicle_breakdown: Record<VehicleStatus, number>;
  recent_trips: Trip[];
}

export interface AnalyticsData {
  fuel_efficiency: number;
  fleet_utilization: number;
  operational_cost: number;
  vehicle_roi: number;
  monthly_revenue: { month: string; revenue: number }[];
  top_costliest_vehicles: { registration_no: string; cost: number }[];
}
