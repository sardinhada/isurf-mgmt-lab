/* migration 4: replace store_paid_until / utilization_paid_until with a monthly_payments table */
CREATE TABLE IF NOT EXISTS monthly_payments (
    partner_id INTEGER NOT NULL,
    product    TEXT    NOT NULL CHECK(product IN ('board_store', 'utilization')),
    year       INTEGER NOT NULL,
    month      INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
    paid       INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (partner_id, product, year, month),
    FOREIGN KEY (partner_id) REFERENCES socio(id) ON DELETE CASCADE
);
ALTER TABLE socio_status DROP COLUMN store_paid_until;
ALTER TABLE socio_status DROP COLUMN utilization_paid_until;
