-- TransitOps Seed Data
-- Run after schema.sql: psql -U postgres -d transitops -f database/seed.sql

\c transitops

-- ============================================================
-- APP SETTINGS
-- ============================================================
INSERT INTO app_settings (depot_name, currency, distance_unit)
VALUES ('TransitOps Central Depot', 'USD', 'km');

-- ============================================================
-- USERS (password: demo123 — bcrypt hash placeholder)
-- ============================================================
INSERT INTO users (email, password_hash, name, role) VALUES
  ('manager@transitops.com',   'demo123', 'Sarah Chen',       'Fleet Manager'),
  ('dispatcher@transitops.com','demo123', 'Mike Johnson',     'Dispatcher'),
  ('safety@transitops.com',    'demo123', 'Lisa Park',        'Safety Officer'),
  ('finance@transitops.com',   'demo123', 'David Williams',   'Financial Analyst');

-- ============================================================
-- VEHICLES
-- ============================================================
INSERT INTO vehicles (registration_no, name_model, type, capacity_kg, odometer, acquisition_cost, status, region) VALUES
  ('VAN-05',  'Ford Transit 350',    'Van',       500.00,  45200.00, 35000.00, 'Available', 'North'),
  ('TRK-12',  'Volvo FH16',          'Truck',    5000.00, 128500.00, 95000.00, 'Available', 'East'),
  ('VAN-08',  'Mercedes Sprinter',   'Van',       800.00,  32100.00, 42000.00, 'Available', 'South'),
  ('TRK-03',  'Scania R450',         'Truck',    8000.00,  89500.00, 110000.00, 'Retired',  'West'),
  ('VAN-11',  'Iveco Daily',         'Van',       600.00,  67800.00, 38000.00, 'In Shop',  'North');

-- ============================================================
-- DRIVERS
-- ============================================================
INSERT INTO drivers (name, license_no, license_category, license_expiry, contact, trip_completion_pct, safety_score, status) VALUES
  ('Alex Rivera',    'DL-2024-001', 'Commercial B', '2027-06-15', '+1-555-0101', 94.50, 92.00, 'Available'),
  ('Maria Santos',   'DL-2023-045', 'Commercial A', '2026-03-20', '+1-555-0102', 88.00, 85.50, 'Available'),
  ('James Okafor',   'DL-2022-112', 'Commercial B', '2025-01-10', '+1-555-0103', 76.00, 78.00, 'Off Duty'),
  ('Priya Sharma',   'DL-2024-078', 'Commercial A', '2024-12-01', '+1-555-0104', 91.00, 95.00, 'Available'),
  ('Tom Bradley',    'DL-2021-033', 'Commercial C', '2026-08-30', '+1-555-0105', 65.00, 60.00, 'Suspended');

-- ============================================================
-- TRIPS (demo flow: Van-05 + Alex, 450kg cargo, completed)
-- ============================================================
INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, final_odometer, fuel_consumed_liters, status, eta, revenue, dispatched_at, completed_at) VALUES
  ('Central Depot', 'Warehouse District', 1, 1, 450.00, 85.00, 45285.00, 12.50, 'Completed', NOW() - INTERVAL '2 hours', 1200.00, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 hours'),
  ('Port Terminal', 'Distribution Hub',   2, 2, 3200.00, 210.00, NULL, NULL, 'Dispatched', NOW() + INTERVAL '3 hours', 4500.00, NOW() - INTERVAL '1 hour', NULL),
  ('City Center',   'Airport Cargo',      NULL, NULL, NULL, 45.00, NULL, NULL, 'Draft', NULL, 0, NULL, NULL);

-- Update vehicle/driver statuses for active dispatched trip
UPDATE vehicles SET status = 'On Trip' WHERE id = 2;
UPDATE drivers SET status = 'On Trip' WHERE id = 2;

-- ============================================================
-- MAINTENANCE LOGS
-- ============================================================
INSERT INTO maintenance_logs (vehicle_id, service_type, cost, service_date, status, notes, completed_at) VALUES
  (5, 'Oil Change',       185.00, CURRENT_DATE - 3,  'Active',    'Scheduled oil change and filter replacement', NULL),
  (1, 'Brake Inspection', 320.00, CURRENT_DATE - 30, 'Completed', 'Brake pads replaced', CURRENT_DATE - 28),
  (2, 'Tire Rotation',    150.00, CURRENT_DATE - 15, 'Completed', 'All tires rotated and balanced', CURRENT_DATE - 15);

-- VAN-11 already In Shop from maintenance active record

-- ============================================================
-- FUEL LOGS
-- ============================================================
INSERT INTO fuel_logs (vehicle_id, log_date, liters, cost) VALUES
  (1, CURRENT_DATE - 2,  12.50, 18.75),
  (1, CURRENT_DATE - 10, 45.00, 67.50),
  (2, CURRENT_DATE - 1,  120.00, 180.00),
  (2, CURRENT_DATE - 8,  95.00, 142.50),
  (3, CURRENT_DATE - 5,  38.00, 57.00);

-- ============================================================
-- EXPENSES
-- ============================================================
INSERT INTO expenses (trip_id, vehicle_id, toll, other, linked_maintenance_cost, status, notes) VALUES
  (1, 1, 15.00, 25.00, 0.00,    'Approved', 'Completed delivery run expenses'),
  (2, 2, 45.00, 80.00, 0.00,    'Pending',  'Active trip tolls and parking'),
  (NULL, 5, 0.00, 50.00, 185.00, 'Approved', 'Maintenance shop visit costs');
