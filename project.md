# TransitOps — AI Agent Build Instructions
### Next.js • Minimalist Black & White (+ single accent for critical states) • Notion-style Motion

You are a senior Next.js frontend engineer and product designer. Build a **production-grade, shipping-quality frontend** for **TransitOps**, a Smart Transport Operations Platform. Do not build a prototype — treat this as a real customer-facing product.

Execute this as a full build: scaffold the app, create all routes/components/types listed below, wire mock data through a centralized API layer, and implement every business rule as real client-side validation logic (not just visual mockup).

---

## 1. Business Context

Logistics companies manage fleets with spreadsheets and manual logs, causing scheduling conflicts, underused vehicles, missed maintenance, expired licenses, and poor visibility. TransitOps centralizes vehicle registration, driver management, dispatching, maintenance, fuel/expense tracking, and analytics into one platform.

## 2. Roles (RBAC)

| Role | Access |
|---|---|
| **Fleet Manager** | Fleet (edit), Drivers (edit), Analytics (view) |
| **Dispatcher** | Fleet (view), Trips (edit) |
| **Safety Officer** | Drivers (edit), Trips (view) |
| **Financial Analyst** | Fuel/Expenses (edit), Analytics (edit) |

Build `src/lib/rbac.ts` as a role → permitted-routes/actions map. Every route/component must check this before rendering edit affordances.

---

## 3. Routes & Screen Specs

### `/login`
- Email + password fields, role selector (RBAC dropdown), "Remember me", "Forgot password?" link.
- Invalid-credentials error state; account lockout message after 5 failed attempts.
- Redirect unauthenticated users here from any other route.

### `/dashboard`
- KPI cards: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%).
- Filter bar: Vehicle Type, Status, Region.
- Recent Trips table: Trip ID, Vehicle, Driver, Status (pill), ETA.
- Vehicle Status breakdown bars: Available / On Trip / In Shop / Retired.

### `/fleet`
- Table: Registration No. (unique), Name/Model, Type, Capacity, Odometer, Acquisition Cost, Status (Available/On Trip/In Shop/Retired).
- Filters: Type, Status, search by reg. no.
- "+ Add Vehicle" modal/drawer.
- Enforce: registration number uniqueness; Retired/In Shop vehicles excluded from all dispatch dropdowns app-wide.

### `/drivers`
- Table: Name, License No., Category, Expiry Date, Contact, Trip Completion %, Safety Score, Status (Available/On Trip/Off Duty/Suspended).
- Visually flag expired licenses.
- Status toggle chips.
- Enforce: expired license or Suspended status blocks trip assignment everywhere.

### `/trips`
- Lifecycle stepper: Draft → Dispatched → Completed → Cancelled.
- Create Trip form: Source, Destination, Vehicle (available-only), Driver (available-only), Cargo Weight, Planned Distance.
- Validate Cargo Weight ≤ vehicle max capacity in real time; block dispatch + show inline error with exact overage if exceeded.
- Live Board: trip cards with route, assigned vehicle/driver, status pill, ETA/note.
- Complete Trip requires final odometer + fuel consumed inputs.
- Enforce transitions: Dispatch → vehicle & driver → On Trip. Complete → both → Available. Cancel (from Dispatched) → both restored to Available. A vehicle/driver already On Trip cannot be selected for another trip.

### `/maintenance`
- Log Service Record form: Vehicle, Service Type, Cost, Date, Status (Active/Completed).
- Service Log table with status pills.
- Enforce: creating an Active record → vehicle → In Shop (removed from all dispatch pools). Closing/completing → vehicle → Available (unless Retired).

### `/fuel-expenses`
- Fuel Logs table: Vehicle, Date, Liters, Cost. "+ Log Fuel".
- Expenses table: Trip, Vehicle, Toll, Other, Linked Maintenance Cost, Total, Status. "+ Add Expense".
- Auto-computed total: **Operational Cost = Fuel + Maintenance**, always derived, never manually entered.

### `/analytics`
- KPI cards: Fuel Efficiency (Distance/Fuel), Fleet Utilization %, Operational Cost, Vehicle ROI.
- Show formula inline: `ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost`.
- Monthly Revenue bar chart.
- Top Costliest Vehicles ranked bar list.
- CSV export button (required). PDF export = bonus.

### `/settings`
- General: Depot Name, Currency, Distance Unit, Save.
- RBAC matrix (read-only): Role × Module → ✓ / view / — .

---

## 4. Business Rules — implement as enforced logic, not just UI copy

1. Vehicle registration number must be unique.
2. Retired / In Shop vehicles never appear in dispatch selection.
3. Expired-license or Suspended drivers cannot be assigned to trips.
4. A vehicle/driver already On Trip cannot be assigned to another trip.
5. Cargo Weight must not exceed vehicle max load capacity.
6. Dispatch → vehicle & driver → On Trip.
7. Complete → vehicle & driver → Available.
8. Cancel a Dispatched trip → vehicle & driver → Available.
9. Active maintenance record → vehicle → In Shop.
10. Closing maintenance → vehicle → Available (unless Retired).

## 5. Data Entities — define as TypeScript interfaces in `src/types/`

`User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense`

Fields per entity are listed in the screen specs above (section 3). Keep status fields as string union types (e.g. `VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired"`).

## 6. Seed / Demo Data Flow

Seed mock data so this flow works end-to-end on first load:
Register Van-05 (500kg capacity) → Register driver Alex → Create trip, 450kg cargo → validated → Dispatch → Vehicle & Driver → On Trip → Complete trip (odometer + fuel) → both → Available → Create maintenance (Oil Change) → Vehicle → In Shop, hidden from dispatch → Analytics reflects updated cost/efficiency.

---

## 7. Design System — Minimalist Black & White + One Accent Color

**Base palette: strict monochrome.**
- Dark mode: bg `#0A0A0A`, surfaces `#141414`→`#1F1F1F`, borders `#2A2A2A`, text `#F5F5F5`/`#A3A3A3`.
- Light mode: bg `#FFFFFF`, surfaces `#FAFAFA`→`#F0F0F0`, borders `#E5E5E5`, text `#0A0A0A`/`#6B6B6B`.
- One sans-serif family (Inter or similar); hierarchy comes from weight/size/spacing, not color.

**Accent color — used ONLY for separation/status meaning, never decoration.**
Pick one accent hue system (e.g. a single blue or amber, your call) and apply it consistently to:
- Status pills: distinct tone/opacity per state (Available, On Trip, In Shop, Retired, Suspended, Draft, Dispatched, Completed, Cancelled) — same hue family, varied by lightness/saturation so states stay visually distinguishable at a glance, monochrome everywhere else.
- Critical alerts: capacity-exceeded errors, expired-license flags, dispatch-blocked banners — use a clearly different warning tone (e.g. red/amber) reserved exclusively for blocking errors so it always reads as "stop."
- Primary CTA buttons (Add Vehicle, Save, Dispatch, Log Fuel) — one consistent accent fill, everything else stays outline/ghost/monochrome.

Do not introduce additional colors beyond: monochrome base + one status-accent family + one error/warning tone.

### Layout
- Notion-style left sidebar, generous whitespace, 1px hairline borders instead of heavy shadows/gradients.
- Calm table/card density, no visual noise.

### Motion — Framer Motion, mandatory on every interactive element
- Sidebar hover: background fade + 2–4px slide.
- Route transitions: fade + 8px vertical slide, ~200–250ms ease-out.
- Table rows: staggered fade-in (~30ms stagger) on load.
- Modals/drawers: scale 98%→100% + fade, spring-based.
- Status pill changes: animate label/background swap, no hard cuts.
- Trip lifecycle stepper: animate progress dot position + connecting line fill.
- Toggles/checkboxes: spring snap, never static.
- Loading: grayscale skeleton shimmer, never a colored spinner.
- Empty states: custom monochrome line-art illustrations, never a blank table.
- Signature "wow" interaction — implement at least one: Cmd+K command palette for cross-module navigation, OR inline-editable table cells with animated save confirmation, OR an animated theme-toggle transition (layout must stay identical in both modes).

### Icons
- One icon system only: Ionicons (or Lucide) — do not mix libraries.

---

## 8. Tech Stack & Architecture

- Next.js App Router, SSR/SSG where beneficial.
- React functional components + hooks only.
- Frontend-only; assume production-ready APIs, mock via `src/utils/api.js`.
- Tailwind CSS with CSS variables for the token system; dark mode via `class` strategy, animated theme switch.
- Framer Motion for all motion above.

```
src/
  app/                  → login, dashboard, fleet, drivers, trips, maintenance, fuel-expenses, analytics, settings
  components/           → Sidebar, KpiCard, StatusPill, DataTable, Modal, CommandPalette, EmptyState, LifecycleStepper
  types/                → User, Role, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense
  utils/api.js          → one function per resource, centralized fetch layer
  lib/rbac.ts           → role → permitted routes/actions map
```

```js
// src/utils/api.js pattern
export const fetchDashboardStats = () => api.get("/dashboard");
export const fetchVehicles = () => api.get("/vehicles");
export const createTrip = (payload) => api.post("/trips", payload); // mirror validation rules client-side before calling
```

---

## 9. Deliverables Checklist

**Mandatory**
- [ ] Responsive layout
- [ ] Auth with RBAC scoping
- [ ] CRUD for Vehicles and Drivers
- [ ] Trip Management with all validations enforced
- [ ] Automatic status transitions reflected instantly
- [ ] Maintenance workflow (auto In Shop / Available)
- [ ] Fuel & Expense tracking with auto-computed operational cost
- [ ] Dashboard with KPIs + filters
- [ ] Analytics charts (fuel efficiency, utilization, ROI, monthly revenue, top costliest vehicles)
- [ ] CSV export

**Bonus**
- [ ] PDF export
- [ ] Email reminder UI for expiring licenses
- [ ] Vehicle document management
- [ ] Global search + sortable tables
- [ ] Cmd+K command palette

---

## 10. Execution Notes for the Agent

- Build fully working state management (React state/context is fine — no backend required) so every rule in section 4 is actually enforced, not just described.
- Every screen in section 3 must exist as a real route with real (seeded) data before adding polish.
- Motion and accent-color usage should never block functionality — implement logic first, then layer in the specified animations and color system.