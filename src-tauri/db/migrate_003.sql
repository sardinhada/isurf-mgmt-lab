/* migration 3: add utilization (monthly) and surf_lessons (annual contract) products */
ALTER TABLE socio_status ADD COLUMN utilization BOOL NOT NULL DEFAULT 0;
ALTER TABLE socio_status ADD COLUMN utilization_paid_until DATE NOT NULL DEFAULT '2000-01-01';
ALTER TABLE socio_status ADD COLUMN surf_lessons BOOL NOT NULL DEFAULT 0;
