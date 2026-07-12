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
    trips: "view",
    maintenance: "view",
    "fuel-expenses": "view",
    analytics: "view",
    settings: "view",
  },
  Dispatcher: {
    dashboard: "view",
    fleet: "view",
    drivers: "view",
    trips: "edit",
    maintenance: "view",
    "fuel-expenses": "view",
    analytics: "view",
    settings: "view",
  },
  "Safety Officer": {
    dashboard: "view",
    fleet: "view",
    drivers: "edit",
    trips: "view",
    maintenance: "view",
    "fuel-expenses": "view",
    analytics: "view",
    settings: "view",
  },
  "Financial Analyst": {
    dashboard: "view",
    fleet: "view",
    drivers: "view",
    trips: "view",
    maintenance: "view",
    "fuel-expenses": "edit",
    analytics: "edit",
    settings: "view",
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
