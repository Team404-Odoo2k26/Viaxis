import type { Driver, Vehicle } from "@/types";

export function isLicenseExpired(expiry: string): boolean {
  return new Date(expiry) < new Date();
}

export function isDispatchableVehicle(v: Vehicle): boolean {
  return v.status === "Available";
}

export function isAssignableDriver(d: Driver): boolean {
  return d.status === "Available" && !isLicenseExpired(d.license_expiry);
}

export function validateCargoWeight(
  weight: number,
  capacity: number
): { valid: boolean; overage: number } {
  const overage = weight - capacity;
  return { valid: weight <= capacity, overage: Math.max(0, overage) };
}

export function computeOperationalCost(
  fuelCost: number,
  maintenanceCost: number
): number {
  return fuelCost + maintenanceCost;
}

export function computeROI(
  revenue: number,
  maintenance: number,
  fuel: number,
  acquisitionCost: number
): number {
  if (acquisitionCost === 0) return 0;
  return (revenue - (maintenance + fuel)) / acquisitionCost;
}

export function computeFuelEfficiency(
  distance: number,
  fuelLiters: number
): number {
  if (fuelLiters === 0) return 0;
  return distance / fuelLiters;
}

export function computeExpenseTotal(expense: {
  toll: number;
  other: number;
  linked_maintenance_cost: number;
}): number {
  return expense.toll + expense.other + expense.linked_maintenance_cost;
}
