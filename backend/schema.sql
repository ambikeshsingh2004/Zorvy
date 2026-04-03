-- Postgres schema matching the previous MySQL definitions, adapted for Supabase
-- Includes default admin user setup

CREATE TYPE user_role AS ENUM ('VIEWER', 'ANALYST', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE record_type AS ENUM ('income', 'expense');

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'VIEWER',
  status user_status DEFAULT 'ACTIVE',
  requested_role user_role NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE records (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  type record_type NOT NULL,
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_records FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trigger to update 'updated_at' on update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_records_modtime
BEFORE UPDATE ON records
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: To seed the default admin, the application layer will hash the password 
-- and insert it into this table during initialization, or you can supply a known hash here.
