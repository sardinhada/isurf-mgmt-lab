/* migration 2: replace nss with ncc, nif, birth_date, postal_code */
ALTER TABLE socio DROP COLUMN nss;
ALTER TABLE socio ADD COLUMN ncc TEXT;
ALTER TABLE socio ADD COLUMN nif TEXT;
ALTER TABLE socio ADD COLUMN birth_date DATE;
ALTER TABLE socio ADD COLUMN postal_code TEXT;
