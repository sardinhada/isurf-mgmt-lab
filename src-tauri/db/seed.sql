-- Development seed data for isurf-mgmt
-- Running this resets socios and their statuses to a known dev state.
-- Cascade delete on socio handles socio_status automatically.

DELETE FROM monthly_payments;
DELETE FROM socio;
DELETE FROM sqlite_sequence WHERE name IN ('socio', 'socio_status');

INSERT INTO socio (id, name, email, phone, address, ncc, nif, birth_date, postal_code) VALUES
    ( 1, 'Carlos García',       'carlos.garcia@example.com',      '612 345 678', 'Calle del Mar 4, Cádiz',              '12345678 9 ZY0',  '123456789', '1985-03-12', '11001'),
    ( 2, 'María López',         'maria.lopez@example.com',         '623 456 789', 'Av. de la Playa 12, Tarifa',          '23456789 0 ZY1',  '234567890', '1990-07-24', '11380'),
    ( 3, 'Alejandro Martínez',  'alex.martinez@example.com',       '634 567 890', 'Paseo Marítimo 7, Conil',             '34567890 1 ZY2',  '345678901', '1978-11-05', '11140'),
    ( 4, 'Sofía Hernández',     'sofia.hernandez@example.com',     '645 678 901', 'C/ Surf 3, El Palmar',                '45678901 2 ZY3',  '456789012', '1995-01-30', '11159'),
    ( 5, 'Pablo Rodríguez',     'pablo.rodriguez@example.com',     '656 789 012', 'Calle Olas 22, Zahara',               '56789012 3 ZY4',  '567890123', '1988-06-18', '11393'),
    ( 6, 'Ana Torres',          'ana.torres@example.com',          '667 890 123', 'Av. Atlántico 8, Barbate',            NULL,              NULL,        '1993-09-02', '11160'),
    ( 7, 'Javier Sánchez',      'javier.sanchez@example.com',      NULL,          'C/ Viento 1, Los Caños de Meca',      '78901234 5 ZY6',  '789012345', '1982-04-14', '11159'),
    ( 8, 'Laura Gomes',         'laura.gomes@example.com',         '678 901 234', 'Rua do Mar 5, Sagres',                '89012345 6 ZY7',  '890123456', '1991-12-20', '8650-357'),
    ( 9, 'Diego Fernández',     'diego.fernandez@example.com',     '689 012 345', 'C/ Poniente 3, Vejer de la Frontera', '90123456 7 ZY8',  '901234567', '1975-08-09', '11150'),
    (10, 'Isabella Ruiz',       'isabella.ruiz@example.com',       '690 123 456', 'Paseo del Atlántico 9, Tarifa',       '01234567 8 ZY9',  '012345678', '1997-02-27', '11380'),
    (11, 'Marco Díaz',          'marco.diaz@example.com',          '601 234 567', 'Av. del Surf 14, El Palmar',          NULL,              NULL,        '1986-05-16', '11159'),
    (12, 'Valentina Moreno',    'valentina.moreno@example.com',    '612 345 679', 'Calle Brisa 2, Conil',                '11223344 5 ZY0',  '112233445', '1992-10-03', '11140'),
    (13, 'Andrés Castro',       'andres.castro@example.com',       '623 456 780', 'C/ Marejada 7, Cádiz',                '22334455 6 ZY1',  '223344556', '1980-03-28', '11001'),
    (14, 'Camila Ortiz',        'camila.ortiz@example.com',        '634 567 891', 'Rua das Dunas 18, Sagres',            '33445566 7 ZY2',  '334455667', '1994-07-11', '8650-357'),
    (15, 'Sebastián Vargas',    'sebastian.vargas@example.com',    NULL,          'Av. del Océano 3, Zahara',            '44556677 8 ZY3',  '445566778', '1983-01-07', '11393'),
    (16, 'Natalia Jiménez',     'natalia.jimenez@example.com',     '656 789 013', 'C/ Levante 11, Tarifa',               NULL,              NULL,        '1996-11-22', '11380'),
    (17, 'Fernando Silva',      'fernando.silva@example.com',      '667 890 124', 'Rua do Cabo 6, Sagres',               '66778899 0 ZY5',  '667788990', '1979-09-15', '8650-357'),
    (18, 'Daniela Ramos',       'daniela.ramos@example.com',       '678 901 235', 'Paseo de la Costa 5, Barbate',        '77889900 1 ZY6',  '778899001', '1989-04-01', '11160'),
    (19, 'Ricardo Pereira',     'ricardo.pereira@example.com',     '689 012 346', 'Rua da Praia 22, Lagos',              '88990011 2 ZY7',  '889900112', '1977-06-30', '8600-315'),
    (20, 'Lucía Alves',         'lucia.alves@example.com',         '690 123 457', 'C/ Tramontana 8, Vejer',              NULL,              NULL,        '1998-02-14', '11150'),
    (21, 'Miguel Santos',       'miguel.santos@example.com',       '601 234 568', 'Av. Surfera 3, El Palmar',            '99001122 3 ZY8',  '990011223', '1984-08-25', '11159'),
    (22, 'Carolina Ferreira',   'carolina.ferreira@example.com',   NULL,          'Rua do Atlântico 14, Sagres',         '00112233 4 ZY9',  '001122334', '1991-03-19', '8650-357'),
    (23, 'Bruno Costa',         'bruno.costa@example.com',         '623 456 781', 'C/ Mistral 9, Los Caños de Meca',     '11223300 5 ZY0',  '112233005', '1987-10-08', '11159'),
    (24, 'Marta Rodrigues',     'marta.rodrigues@example.com',     '634 567 892', 'Rua do Surf 1, Lagos',                '22334411 6 ZY1',  '223344116', '1993-05-23', '8600-315'),
    (25, 'Tomás Lopes',         'tomas.lopes@example.com',         '645 678 902', 'Paseo de la Playa 7, Conil',          '33445522 7 ZY2',  '334455227', '1981-12-04', '11140');

-- status: active | inactive | suspended
-- board_store/utilization: 1 = product is active (monthly payments tracked in monthly_payments)
-- surf_lessons: 1 = active annual contract
INSERT INTO socio_status (partner_id, joined_at, status, paid_until, board_store, utilization, surf_lessons) VALUES
    ( 1, '2022-06-01', 'active',    '2026-06-01', 1, 1, 1),
    ( 2, '2023-03-15', 'active',    '2026-03-15', 0, 0, 0),
    ( 3, '2021-09-10', 'inactive',  '2025-01-10', 0, 0, 0),
    ( 4, '2024-01-20', 'active',    '2027-01-20', 1, 1, 0),
    ( 5, '2023-07-05', 'suspended', '2024-07-05', 1, 0, 1),
    ( 6, '2024-11-01', 'active',    '2025-11-01', 0, 1, 0),
    ( 7, '2022-04-18', 'active',    '2026-04-18', 1, 0, 1),
    ( 8, '2023-08-22', 'active',    '2026-08-22', 0, 0, 0),
    ( 9, '2020-05-14', 'inactive',  '2024-05-14', 0, 0, 0),
    (10, '2024-02-10', 'active',    '2027-02-10', 1, 1, 1),
    (11, '2023-11-30', 'active',    '2026-11-30', 0, 1, 0),
    (12, '2022-10-05', 'suspended', '2024-10-05', 0, 0, 0),
    (13, '2021-03-19', 'active',    '2026-03-19', 1, 0, 1),
    (14, '2024-06-01', 'active',    '2025-06-01', 0, 1, 0),
    (15, '2022-12-12', 'inactive',  '2024-12-12', 1, 0, 0),
    (16, '2023-05-27', 'active',    '2026-05-27', 0, 0, 1),
    (17, '2020-09-08', 'active',    '2026-09-08', 1, 1, 1),
    (18, '2024-03-03', 'active',    '2025-03-03', 0, 0, 0),
    (19, '2021-07-21', 'suspended', '2024-07-21', 0, 0, 0),
    (20, '2023-01-15', 'active',    '2026-01-15', 1, 1, 0),
    (21, '2024-08-09', 'active',    '2025-08-09', 0, 0, 1),
    (22, '2022-02-28', 'inactive',  '2024-02-28', 0, 0, 0),
    (23, '2023-10-17', 'active',    '2026-10-17', 1, 1, 1),
    (24, '2024-04-25', 'active',    '2025-04-25', 0, 0, 0),
    (25, '2022-07-30', 'active',    '2026-07-30', 1, 0, 1);

-- monthly_payments seed: Jan–Mar 2026 paid for active board_store/utilization socios
INSERT INTO monthly_payments (partner_id, product, year, month, paid) VALUES
    -- board_store: socios 1, 4, 7, 10, 13, 17, 20, 23, 25
    ( 1, 'board_store', 2026, 1, 1), ( 1, 'board_store', 2026, 2, 1), ( 1, 'board_store', 2026, 3, 1),
    ( 4, 'board_store', 2026, 1, 1), ( 4, 'board_store', 2026, 2, 1), ( 4, 'board_store', 2026, 3, 1),
    ( 7, 'board_store', 2026, 1, 1), ( 7, 'board_store', 2026, 2, 0), ( 7, 'board_store', 2026, 3, 1),
    (10, 'board_store', 2026, 1, 1), (10, 'board_store', 2026, 2, 1), (10, 'board_store', 2026, 3, 1),
    (13, 'board_store', 2026, 1, 1), (13, 'board_store', 2026, 2, 1), (13, 'board_store', 2026, 3, 0),
    (17, 'board_store', 2026, 1, 1), (17, 'board_store', 2026, 2, 1), (17, 'board_store', 2026, 3, 1),
    (20, 'board_store', 2026, 1, 1), (20, 'board_store', 2026, 2, 0), (20, 'board_store', 2026, 3, 1),
    (23, 'board_store', 2026, 1, 1), (23, 'board_store', 2026, 2, 1), (23, 'board_store', 2026, 3, 1),
    (25, 'board_store', 2026, 1, 0), (25, 'board_store', 2026, 2, 1), (25, 'board_store', 2026, 3, 1),
    -- utilization: socios 1, 4, 6, 10, 11, 14, 17, 20, 23
    ( 1, 'utilization', 2026, 1, 1), ( 1, 'utilization', 2026, 2, 1), ( 1, 'utilization', 2026, 3, 1),
    ( 4, 'utilization', 2026, 1, 1), ( 4, 'utilization', 2026, 2, 1), ( 4, 'utilization', 2026, 3, 0),
    ( 6, 'utilization', 2026, 1, 1), ( 6, 'utilization', 2026, 2, 1), ( 6, 'utilization', 2026, 3, 1),
    (10, 'utilization', 2026, 1, 1), (10, 'utilization', 2026, 2, 1), (10, 'utilization', 2026, 3, 1),
    (11, 'utilization', 2026, 1, 0), (11, 'utilization', 2026, 2, 1), (11, 'utilization', 2026, 3, 1),
    (14, 'utilization', 2026, 1, 1), (14, 'utilization', 2026, 2, 0), (14, 'utilization', 2026, 3, 1),
    (17, 'utilization', 2026, 1, 1), (17, 'utilization', 2026, 2, 1), (17, 'utilization', 2026, 3, 1),
    (20, 'utilization', 2026, 1, 1), (20, 'utilization', 2026, 2, 1), (20, 'utilization', 2026, 3, 0),
    (23, 'utilization', 2026, 1, 1), (23, 'utilization', 2026, 2, 1), (23, 'utilization', 2026, 3, 1);
