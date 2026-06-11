-- Initialize twin_lakes database and schema
CREATE DATABASE IF NOT EXISTS twin_lakes;
USE twin_lakes;

-- users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notifications_seen_at DATETIME NULL
);

-- rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number VARCHAR(64) NOT NULL UNIQUE,
  type VARCHAR(128),
  capacity INT DEFAULT 1,
  default_rate DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(32) DEFAULT 'available',
  housekeeping_status VARCHAR(32) DEFAULT 'clean'
);

-- reservations
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  guest_contact VARCHAR(255),
  status VARCHAR(32) DEFAULT 'pending',
  checkin_date DATE,
  checkout_date DATE,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- reservation_rooms
CREATE TABLE IF NOT EXISTS reservation_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  room_id INT NOT NULL,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- folios and items
CREATE TABLE IF NOT EXISTS folios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NOT NULL,
  total_amount DECIMAL(14,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  status VARCHAR(32) DEFAULT 'open',
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS folio_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folio_id INT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  type VARCHAR(32) DEFAULT 'other',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folio_id) REFERENCES folios(id) ON DELETE CASCADE
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  folio_id INT,
  amount DECIMAL(14,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  method VARCHAR(64),
  reference VARCHAR(128),
  received_by INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (folio_id) REFERENCES folios(id) ON DELETE SET NULL,
  FOREIGN KEY (received_by) REFERENCES users(id) ON DELETE SET NULL
);

-- finance journal entries
CREATE TABLE IF NOT EXISTS finance_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entry_type VARCHAR(32) NOT NULL,
  category VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  entry_date DATETIME NOT NULL,
  created_by INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- activities
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_capacity INT DEFAULT 0,
  price DECIMAL(12,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS activity_schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  activity_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  end_at DATETIME NULL,
  capacity INT NULL,
  status VARCHAR(32) DEFAULT 'not_started',
  location VARCHAR(255),
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id INT NOT NULL,
  reservation_id INT NOT NULL,
  pax_count INT DEFAULT 1,
  FOREIGN KEY (schedule_id) REFERENCES activity_schedules(id) ON DELETE CASCADE,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- housekeeping tasks
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  status VARCHAR(32) DEFAULT 'dirty',
  assigned_to INT,
  notes TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  actor_id INT,
  action VARCHAR(255),
  object_type VARCHAR(128),
  object_id INT,
  details JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- user invites
CREATE TABLE IF NOT EXISTS user_invites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(64) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- shift reconciliations (manual till close)
CREATE TABLE IF NOT EXISTS shift_reconciliations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_by INT NOT NULL,
  expected_cash DECIMAL(14,2) DEFAULT 0,
  actual_cash DECIMAL(14,2) DEFAULT 0,
  expected_mobile DECIMAL(14,2) DEFAULT 0,
  actual_mobile DECIMAL(14,2) DEFAULT 0,
  expected_card DECIMAL(14,2) DEFAULT 0,
  actual_card DECIMAL(14,2) DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'USD',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- exchange rates
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  base_currency CHAR(3) NOT NULL,
  target_currency CHAR(3) NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  effective_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
