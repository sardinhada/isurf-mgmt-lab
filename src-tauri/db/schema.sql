-- Consolidated schema (init.sql + migrations 002–005)
-- Represents the current database structure.

CREATE TABLE IF NOT EXISTS socio (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    phone       TEXT,
    address     TEXT,
    ncc         TEXT,
    nif         TEXT,
    birth_date  DATE,
    postal_code TEXT,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS socio_status (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id  INTEGER NOT NULL UNIQUE, -- 1-to-1 with socio
    joined_at   DATE    NOT NULL,
    status      TEXT    NOT NULL,        -- active | inactive | suspended
    paid_until  DATE    NOT NULL,
    board_store BOOL    NOT NULL,
    utilization BOOL    NOT NULL DEFAULT 0,
    surf_lessons BOOL   NOT NULL DEFAULT 0,
    FOREIGN KEY (partner_id) REFERENCES socio(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monthly_payments (
    partner_id  INTEGER NOT NULL,
    product     TEXT    NOT NULL CHECK(product IN ('board_store', 'utilization')),
    year        INTEGER NOT NULL,
    month       INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
    paid        INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (partner_id, product, year, month),
    FOREIGN KEY (partner_id) REFERENCES socio(id) ON DELETE CASCADE
);
