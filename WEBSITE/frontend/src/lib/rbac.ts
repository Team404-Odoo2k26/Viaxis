import type { Role } from "@/types";

export type Permission = "view" | "edit" | "none";

export type Module =
  | "dashboard"
  | "fleet"
  | "drivers"
  | "trips"
  | "maintenance"
  | "fuel-expenses"
  | "analytics"
  | "settings";

const RBAC_MATRIX: Record<Role, Record<Module, Permission>> = {
  "Fleet Manager": {
    dashboard: "view",
    fleet: "edit",
    drivers: "edit",
    trips: "none",
    maintenance: "edit",
    "fuel-expenses": "none",
    analytics: "view",
    settings: "edit",
  },
  Dispatcher: {
    dashboard: "view",
    fleet: "none",
    drivers: "none",
    trips: "edit",
    maintenance: "none",
    "fuel-expenses": "none",
    analytics: "none",
    settings: "none",
  },
  "Safety Officer": {
    dashboard: "view",
    fleet: "none",
    drivers: "edit",
    trips: "none",
    maintenance: "none",
    "fuel-expenses": "none",
    analytics: "none",
    settings: "none",
  },
  "Financial Analyst": {
    dashboard: "view",
    fleet: "none",
    drivers: "none",
    trips: "none",
    maintenance: "none",
    "fuel-expenses": "edit",
    analytics: "edit",
    settings: "none",
  },
};

export function canAccess(role: Role | null, module: Module): boolean {
  if (!role) return false;
  return RBAC_MATRIX[role][module] !== "none";
}

export function canEdit(role: Role | null, module: Module): boolean {
  if (!role) return false;
  return RBAC_MATRIX[role][module] === "edit";
}

export function getPermissions(role: Role): Record<Module, Permission> {
  return RBAC_MATRIX[role];
}

export const NAV_ITEMS: { href: string; label: string; module: Module }[] = [
  { href: "/dashboard", label: "Dashboard", module: "dashboard" },
  { href: "/fleet", label: "Fleet", module: "fleet" },
  { href: "/drivers", label: "Drivers", module: "drivers" },
  { href: "/trips", label: "Trips", module: "trips" },
  { href: "/maintenance", label: "Maintenance", module: "maintenance" },
  { href: "/fuel-expenses", label: "Fuel & Expenses", module: "fuel-expenses" },
  { href: "/analytics", label: "Analytics", module: "analytics" },
  { href: "/settings", label: "Settings", module: "settings" },
];

export { RBAC_MATRIX };
