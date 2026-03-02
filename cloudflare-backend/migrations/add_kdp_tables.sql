-- KDP buyers auth tables
CREATE TABLE IF NOT EXISTS kdp_access_codes (
  code_hash TEXT PRIMARY KEY,
  label TEXT,
  active INTEGER DEFAULT 1,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kdp_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  access_code_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME,
  FOREIGN KEY (access_code_hash) REFERENCES kdp_access_codes(code_hash)
);

-- Seed universal KDP code (hash of 914327)
INSERT OR IGNORE INTO kdp_access_codes (code_hash, label, active, max_uses, used_count)
VALUES ('cef8bbcf5d7ed1f46812e2928285ccccab95f7555d70409051f37f60f43bda22', 'KDP Universal Code', 1, NULL, 0);
