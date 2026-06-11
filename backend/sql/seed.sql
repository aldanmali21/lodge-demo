USE twin_lakes;

-- Initial rooms based on the lodge operations described in the SRS.
INSERT IGNORE INTO rooms (number, type, capacity, default_rate, status) VALUES
  ('R101', 'Standard Double', 2, 120.00, 'available'),
  ('R102', 'Standard Double', 2, 120.00, 'available'),
  ('R103', 'Standard Twin', 2, 140.00, 'available'),
  ('R104', 'Deluxe Double', 2, 180.00, 'available'),
  ('R105', 'Deluxe Twin', 2, 180.00, 'available'),
  ('R201', 'Family Room', 4, 240.00, 'available'),
  ('R202', 'Family Room', 4, 240.00, 'available'),
  ('R203', 'Executive Suite', 2, 320.00, 'available'),
  ('R204', 'Executive Suite', 2, 320.00, 'available'),
  ('R205', 'Honeymoon Suite', 2, 380.00, 'available');

-- Initial staff accounts representing the roles in the SRS.
-- Default password for all accounts: password123
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
  ('System Administrator', 'admin@twinlakes.local', '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm', 'admin'),
  ('Front Desk Lead', 'frontdesk@twinlakes.local', '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm', 'frontdesk'),
  ('Restaurant POS', 'pos@twinlakes.local', '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm', 'pos'),
  ('Activity Guide', 'guide@twinlakes.local', '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm', 'guide'),
  ('Housekeeping Lead', 'housekeeping@twinlakes.local', '$2b$10$uDIxP063Oj3Sz0qpomgWJ.lnN1kaVViRLHD1lLsGquv/S2o3CM/nm', 'housekeeping');

-- Initial activity definitions referenced by the SRS (with per-person prices in USD).
INSERT IGNORE INTO activities (name, description, max_capacity, price) VALUES
  ('Kazinga Boat Cruise', 'Scheduled lake cruise for lodge guests.', 10, 85.00),
  ('Game Drive', 'Guided safari drive through the park and surrounding reserve.', 6, 120.00),
  ('Nature Walk', 'Short guided walking experience around the lodge grounds.', 8, 40.00),
  ('Bird Watching', 'Early morning birding session with a guide.', 8, 35.00),
  ('Cultural Visit', 'Local community and cultural experience.', 12, 30.00);

-- Optional opening exchange-rate reference for manual financial conversion.
INSERT IGNORE INTO exchange_rates (base_currency, target_currency, rate, effective_date) VALUES
  ('USD', 'UGX', 3700.00000000, CURDATE());

-- Demo: activity schedules for today so Activities page is not empty
INSERT IGNORE INTO activity_schedules (activity_id, scheduled_at, location)
SELECT a.id, CONCAT(CURDATE(), ' 06:00:00'), 'Main Gate — Kasenyi Sector'
FROM activities a WHERE a.name = 'Game Drive' LIMIT 1;

INSERT IGNORE INTO activity_schedules (activity_id, scheduled_at, location)
SELECT a.id, CONCAT(CURDATE(), ' 15:00:00'), 'Mweya Pier'
FROM activities a WHERE a.name = 'Kazinga Boat Cruise' LIMIT 1;

-- Demo reservation (checked-in, so system looks active)
INSERT IGNORE INTO reservations (id, guest_name, guest_contact, status, checkin_date, checkout_date, created_by)
SELECT 1, 'Eleanor Vance', '+256 700 000001', 'checked_in', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 3 DAY),
       (SELECT id FROM users WHERE role = 'frontdesk' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 1);

INSERT IGNORE INTO reservation_rooms (reservation_id, room_id)
SELECT 1, r.id FROM rooms r WHERE r.number = 'R203'
AND NOT EXISTS (SELECT 1 FROM reservation_rooms WHERE reservation_id = 1);

-- Folio for the demo reservation
INSERT IGNORE INTO folios (id, reservation_id, total_amount, currency, status)
SELECT 1, 1, 1195.50, 'USD', 'open'
WHERE NOT EXISTS (SELECT 1 FROM folios WHERE id = 1);

-- Folio line items
INSERT IGNORE INTO folio_items (folio_id, description, amount, currency, type)
SELECT 1, 'Executive Suite — Night 1', 320.00, 'USD', 'room'
WHERE NOT EXISTS (SELECT 1 FROM folio_items WHERE folio_id = 1 AND description = 'Executive Suite — Night 1');

INSERT IGNORE INTO folio_items (folio_id, description, amount, currency, type)
SELECT 1, 'Restaurant: Dinner (Wine, Steaks)', 125.50, 'USD', 'pos'
WHERE NOT EXISTS (SELECT 1 FROM folio_items WHERE folio_id = 1 AND type = 'pos');

INSERT IGNORE INTO folio_items (folio_id, description, amount, currency, type)
SELECT 1, 'Activity: Kazinga Boat Cruise (2 pax)', 170.00, 'USD', 'activity'
WHERE NOT EXISTS (SELECT 1 FROM folio_items WHERE folio_id = 1 AND type = 'activity');

INSERT IGNORE INTO folio_items (folio_id, description, amount, currency, type)
SELECT 1, 'Executive Suite — Night 2', 320.00, 'USD', 'room'
WHERE NOT EXISTS (SELECT 1 FROM folio_items WHERE folio_id = 1 AND description = 'Executive Suite — Night 2');

-- Demo second reservation (confirmed, arriving today)
INSERT IGNORE INTO reservations (id, guest_name, guest_contact, status, checkin_date, checkout_date, created_by)
SELECT 2, 'James Ochieng', '+256 700 000002', 'confirmed', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 2 DAY),
       (SELECT id FROM users WHERE role = 'frontdesk' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM reservations WHERE id = 2);

INSERT IGNORE INTO reservation_rooms (reservation_id, room_id)
SELECT 2, r.id FROM rooms r WHERE r.number = 'R104'
AND NOT EXISTS (SELECT 1 FROM reservation_rooms WHERE reservation_id = 2);

INSERT IGNORE INTO folios (id, reservation_id, total_amount, currency, status)
SELECT 2, 2, 360.00, 'USD', 'open'
WHERE NOT EXISTS (SELECT 1 FROM folios WHERE id = 2);

-- Mark demo rooms to reflect reservation statuses
UPDATE rooms SET status = 'occupied' WHERE number = 'R203';
UPDATE rooms SET status = 'available' WHERE number = 'R104';

-- Demo audit log entries so notifications drawer is not empty
INSERT IGNORE INTO audit_logs (actor_id, action, object_type, object_id, details)
SELECT u.id, 'check_in', 'reservation', 1, JSON_OBJECT('guestName','Eleanor Vance','room','R203')
FROM users u WHERE u.role = 'frontdesk' LIMIT 1;

INSERT IGNORE INTO audit_logs (actor_id, action, object_type, object_id, details)
SELECT u.id, 'create_reservation', 'reservation', 2, JSON_OBJECT('guestName','James Ochieng','room','R104')
FROM users u WHERE u.role = 'frontdesk' LIMIT 1;
