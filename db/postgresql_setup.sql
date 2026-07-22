BEGIN;

CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY,
 full_name VARCHAR(150) NOT NULL,
 email VARCHAR(254) NOT NULL,
 password_hash TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uidx ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS user_sessions (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token_hash CHAR(64) NOT NULL UNIQUE,
 expires_at TIMESTAMPTZ NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS user_sessions_user_idx ON user_sessions (user_id);
CREATE INDEX IF NOT EXISTS user_sessions_expiry_idx ON user_sessions (expires_at);

CREATE TABLE IF NOT EXISTS calculations (
 id BIGSERIAL PRIMARY KEY,
 user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
 taxpayer_name VARCHAR(150) NOT NULL,
 document_number VARCHAR(20),
 category SMALLINT NOT NULL CHECK (category BETWEEN 1 AND 5),
 tax_year SMALLINT NOT NULL DEFAULT 2026,
 input_data JSONB NOT NULL,
 result_data JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS calculations_user_created_idx ON calculations (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS calculations_document_idx ON calculations (document_number);

DELETE FROM user_sessions WHERE expires_at <= NOW();
COMMIT;