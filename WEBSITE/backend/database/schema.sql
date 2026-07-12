-- TransitOps PostgreSQL Schema
-- Run: psql -U postgres -f database/schema.sql

DROP DATABASE IF EXISTS transitops;
CREATE DATABASE transitops;

\c transitops

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM (
  'Fleet Manager',
  'Dispatcher',
  'Safety Officer',
  'Financial Analyst'
);

CREATE TYPE vehicle_status AS ENUM (
  'Available',
  'On Trip',
  'In Shop',
  'Retired'
);

CREATE TYPE driver_status AS ENUM (
  'Available',
  'On Trip',
  'Off Duty',
  'Suspended'
);

CREATE TYPE trip_status AS ENUM (
  'Draft',
  'Dispatched',
  'Completed',
  'Cancelled'
);

CREATE TYPE maintenance_status AS ENUM (
  'Active',
  'Completed'
);

CREATE TYPE expense_status AS ENUM (
  'Pending',
  'Approved',
  'Rejected'
);

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(255) NOT NULL,
  role            user_role NOT NULL,
  remember_me     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE login_attempts (
  email           VARCHAR(255) PRIMARY KEY,
  failed_count    INTEGER DEFAULT 0,
  locked_until    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
  id                SERIAL PRIMARY KEY,
  registration_no   VARCHAR(50) UNIQUE NOT NULL,
  name_model        VARCHAR(255) NOT NULL,
  type              VARCHAR(100) NOT NULL,
  capacity_kg       DECIMAL(10, 2) NOT NULL CHECK (capacity_kg > 0),
  odometer          DECIMAL(12, 2) DEFAULT 0,
  acquisition_cost  DECIMAL(12, 2) NOT NULL CHECK (acquisition_cost >= 0),
  status            vehicle_status DEFAULT 'Available',
  region            VARCHAR(100),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(type);
CREATE INDEX idx_vehicles_region ON vehicles(region);

-- ============================================================
-- DRIVERS
-- ============================================================
CREATE TABLE drivers (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  license_no            VARCHAR(100) UNIQUE NOT NULL,
  license_category      VARCHAR(50) NOT NULL,
  license_expiry        DATE NOT NULL,
  contact               VARCHAR(50),
  trip_completion_pct   DECIMAL(5, 2) DEFAULT 0 CHECK (trip_completion_pct BETWEEN 0 AND 100),
  safety_score          DECIMAL(5, 2) DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
  status                driver_status DEFAULT 'Available',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry);

-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE trips (
  id                    SERIAL PRIMARY KEY,
  source                VARCHAR(255) NOT NULL,
  destination           VARCHAR(255) NOT NULL,
  vehicle_id            INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id             INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  cargo_weight_kg       DECIMAL(10, 2) CHECK (cargo_weight_kg >= 0),
  planned_distance_km   DECIMAL(10, 2) CHECK (planned_distance_km >= 0),
  final_odometer        DECIMAL(12, 2),
  fuel_consumed_liters  DECIMAL(10, 2),
  status                trip_status DEFAULT 'Draft',
  eta                   TIMESTAMPTZ,
  notes                 TEXT,
  revenue               DECIMAL(12, 2) DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  dispatched_at         TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ
);

CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);

-- ============================================================
-- MAINTENANCE
-- ============================================================
CREATE TABLE maintenance_logs (
  id              SERIAL PRIMARY KEY,
  vehicle_id      INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_type    VARCHAR(100) NOT NULL,
  cost            DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  service_date    DATE NOT NULL,
  status          maintenance_status DEFAULT 'Active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_status ON maintenance_logs(status);

-- ============================================================
-- FUEL & EXPENSES
-- ============================================================
CREATE TABLE fuel_logs (
  id          SERIAL PRIMARY KEY,
  vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  log_date    DATE NOT NULL,
  liters      DECIMAL(10, 2) NOT NULL CHECK (liters > 0),
  cost        DECIMAL(10, 2) NOT NULL CHECK (cost >= 0),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_date ON fuel_logs(log_date);

CREATE TABLE expenses (
  id                        SERIAL PRIMARY KEY,
  trip_id                   INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  vehicle_id                INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  toll                      DECIMAL(10, 2) DEFAULT 0 CHECK (toll >= 0),
  other                     DECIMAL(10, 2) DEFAULT 0 CHECK (other >= 0),
  linked_maintenance_cost   DECIMAL(10, 2) DEFAULT 0 CHECK (linked_maintenance_cost >= 0),
  status                    expense_status DEFAULT 'Pending',
  notes                     TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Computed total column: toll + other + linked_maintenance_cost
-- Operational Cost = Fuel + Maintenance (computed at query time)

CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE app_settings (
  id              SERIAL PRIMARY KEY,
  depot_name      VARCHAR(255) DEFAULT 'TransitOps HQ',
  currency        VARCHAR(10) DEFAULT 'USD',
  distance_unit   VARCHAR(10) DEFAULT 'km',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HELPER VIEWS
-- ============================================================
CREATE OR REPLACE VIEW v_expense_totals AS
SELECT
  e.*,
  (COALESCE(e.toll, 0) + COALESCE(e.other, 0) + COALESCE(e.linked_maintenance_cost, 0)) AS total
FROM expenses e;

CREATE OR REPLACE VIEW v_vehicle_operational_costs AS
SELECT
  v.id AS vehicle_id,
  v.registration_no,
  COALESCE(SUM(fl.cost), 0) AS total_fuel_cost,
  COALESCE(SUM(ml.cost), 0) AS total_maintenance_cost,
  COALESCE(SUM(fl.cost), 0) + COALESCE(SUM(ml.cost), 0) AS operational_cost
FROM vehicles v
LEFT JOIN fuel_logs fl ON fl.vehicle_id = v.id
LEFT JOIN maintenance_logs ml ON ml.vehicle_id = v.id AND ml.status = 'Completed'
GROUP BY v.id, v.registration_no;

CREATE OR REPLACE VIEW v_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM vehicles WHERE status != 'Retired') AS total_vehicles,
  (SELECT COUNT(*) FROM vehicles WHERE status = 'Available') AS available_vehicles,
  (SELECT COUNT(*) FROM vehicles WHERE status = 'In Shop') AS vehicles_in_maintenance,
  (SELECT COUNT(*) FROM trips WHERE status = 'Dispatched') AS active_trips,
  (SELECT COUNT(*) FROM trips WHERE status = 'Draft') AS pending_trips,
  (SELECT COUNT(*) FROM drivers WHERE status IN ('Available', 'On Trip')) AS drivers_on_duty;

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON drivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
