CREATE TABLE users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL CHECK(length(btrim(name))>0),
 email VARCHAR(254) NOT NULL CHECK(email=lower(btrim(email))), password_hash TEXT NOT NULL,
 is_active BOOLEAN NOT NULL DEFAULT true, session_version INTEGER NOT NULL DEFAULT 1 CHECK(session_version>0),
 version INTEGER NOT NULL DEFAULT 1 CHECK(version>0), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_key ON users(email);
CREATE UNIQUE INDEX users_email_ci ON users(lower(email));
CREATE TABLE auth_rate_limits (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), bucket_key CHAR(64) NOT NULL,
 window_started_at TIMESTAMPTZ NOT NULL, window_seconds INTEGER NOT NULL CHECK(window_seconds>0),
 attempt_count INTEGER NOT NULL DEFAULT 0 CHECK(attempt_count>=0), expires_at TIMESTAMPTZ NOT NULL,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(bucket_key,window_started_at,window_seconds)
);
CREATE INDEX auth_rate_limits_expires_at_idx ON auth_rate_limits(expires_at);
