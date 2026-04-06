/* migration 5: add free-text observations field to socio */
ALTER TABLE socio ADD COLUMN observacoes TEXT;
