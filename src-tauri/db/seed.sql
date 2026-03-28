-- Development seed data for isurf-mgmt
-- Running this resets socios and their statuses to a known dev state.
-- Cascade delete on socio handles socio_status automatically.

DELETE FROM socio;
DELETE FROM sqlite_sequence WHERE name IN ('socio', 'socio_status');

INSERT INTO socio (id, name, email, phone, address, nss) VALUES
    ( 1, 'Carlos García',       'carlos.garcia@example.com',      '612 345 678', 'Calle del Mar 4, Cádiz',              'ES1234567890'),
    ( 2, 'María López',         'maria.lopez@example.com',         '623 456 789', 'Av. de la Playa 12, Tarifa',          'ES2345678901'),
    ( 3, 'Alejandro Martínez',  'alex.martinez@example.com',       '634 567 890', 'Paseo Marítimo 7, Conil',             'ES3456789012'),
    ( 4, 'Sofía Hernández',     'sofia.hernandez@example.com',     '645 678 901', 'C/ Surf 3, El Palmar',                'ES4567890123'),
    ( 5, 'Pablo Rodríguez',     'pablo.rodriguez@example.com',     '656 789 012', 'Calle Olas 22, Zahara',               'ES5678901234'),
    ( 6, 'Ana Torres',          'ana.torres@example.com',          '667 890 123', 'Av. Atlántico 8, Barbate',            NULL),
    ( 7, 'Javier Sánchez',      'javier.sanchez@example.com',      NULL,          'C/ Viento 1, Los Caños de Meca',      'ES7890123456'),
    ( 8, 'Laura Gomes',         'laura.gomes@example.com',         '678 901 234', 'Rua do Mar 5, Sagres',                'PT1234567890'),
    ( 9, 'Diego Fernández',     'diego.fernandez@example.com',     '689 012 345', 'C/ Poniente 3, Vejer de la Frontera', 'ES8901234567'),
    (10, 'Isabella Ruiz',       'isabella.ruiz@example.com',       '690 123 456', 'Paseo del Atlántico 9, Tarifa',       'ES9012345678'),
    (11, 'Marco Díaz',          'marco.diaz@example.com',          '601 234 567', 'Av. del Surf 14, El Palmar',          NULL),
    (12, 'Valentina Moreno',    'valentina.moreno@example.com',    '612 345 679', 'Calle Brisa 2, Conil',                'ES0123456789'),
    (13, 'Andrés Castro',       'andres.castro@example.com',       '623 456 780', 'C/ Marejada 7, Cádiz',                'ES1234567891'),
    (14, 'Camila Ortiz',        'camila.ortiz@example.com',        '634 567 891', 'Rua das Dunas 18, Sagres',            'PT2345678901'),
    (15, 'Sebastián Vargas',    'sebastian.vargas@example.com',    NULL,          'Av. del Océano 3, Zahara',            'ES2345678902'),
    (16, 'Natalia Jiménez',     'natalia.jimenez@example.com',     '656 789 013', 'C/ Levante 11, Tarifa',               NULL),
    (17, 'Fernando Silva',      'fernando.silva@example.com',      '667 890 124', 'Rua do Cabo 6, Sagres',               'PT3456789012'),
    (18, 'Daniela Ramos',       'daniela.ramos@example.com',       '678 901 235', 'Paseo de la Costa 5, Barbate',        'ES3456789013'),
    (19, 'Ricardo Pereira',     'ricardo.pereira@example.com',     '689 012 346', 'Rua da Praia 22, Lagos',              'PT4567890123'),
    (20, 'Lucía Alves',         'lucia.alves@example.com',         '690 123 457', 'C/ Tramontana 8, Vejer',              NULL),
    (21, 'Miguel Santos',       'miguel.santos@example.com',       '601 234 568', 'Av. Surfera 3, El Palmar',            'PT5678901234'),
    (22, 'Carolina Ferreira',   'carolina.ferreira@example.com',   NULL,          'Rua do Atlântico 14, Sagres',         'PT6789012345'),
    (23, 'Bruno Costa',         'bruno.costa@example.com',         '623 456 781', 'C/ Mistral 9, Los Caños de Meca',     'PT7890123456'),
    (24, 'Marta Rodrigues',     'marta.rodrigues@example.com',     '634 567 892', 'Rua do Surf 1, Lagos',                'PT8901234567'),
    (25, 'Tomás Lopes',         'tomas.lopes@example.com',         '645 678 902', 'Paseo de la Playa 7, Conil',          'PT9012345678');

-- status: active | inactive | suspended
-- board_store: 1 = has guardería slot, 0 = no
INSERT INTO socio_status (partner_id, joined_at, status, paid_until, board_store, store_paid_until) VALUES
    ( 1, '2022-06-01', 'active',    '2026-06-01', 1, '2026-04-01'),
    ( 2, '2023-03-15', 'active',    '2026-03-15', 0, '2026-03-15'),
    ( 3, '2021-09-10', 'inactive',  '2025-01-10', 0, '2025-01-10'),
    ( 4, '2024-01-20', 'active',    '2027-01-20', 1, '2026-04-01'),
    ( 5, '2023-07-05', 'suspended', '2024-07-05', 1, '2024-08-01'),
    ( 6, '2024-11-01', 'active',    '2025-11-01', 0, '2025-11-01'),
    ( 7, '2022-04-18', 'active',    '2026-04-18', 1, '2026-04-01'),
    ( 8, '2023-08-22', 'active',    '2026-08-22', 0, '2026-08-22'),
    ( 9, '2020-05-14', 'inactive',  '2024-05-14', 0, '2024-05-14'),
    (10, '2024-02-10', 'active',    '2027-02-10', 1, '2026-05-01'),
    (11, '2023-11-30', 'active',    '2026-11-30', 0, '2026-11-30'),
    (12, '2022-10-05', 'suspended', '2024-10-05', 0, '2024-10-05'),
    (13, '2021-03-19', 'active',    '2026-03-19', 1, '2026-04-01'),
    (14, '2024-06-01', 'active',    '2025-06-01', 0, '2025-06-01'),
    (15, '2022-12-12', 'inactive',  '2024-12-12', 1, '2024-12-12'),
    (16, '2023-05-27', 'active',    '2026-05-27', 0, '2026-05-27'),
    (17, '2020-09-08', 'active',    '2026-09-08', 1, '2026-04-01'),
    (18, '2024-03-03', 'active',    '2025-03-03', 0, '2025-03-03'),
    (19, '2021-07-21', 'suspended', '2024-07-21', 0, '2024-07-21'),
    (20, '2023-01-15', 'active',    '2026-01-15', 1, '2026-04-01'),
    (21, '2024-08-09', 'active',    '2025-08-09', 0, '2025-08-09'),
    (22, '2022-02-28', 'inactive',  '2024-02-28', 0, '2024-02-28'),
    (23, '2023-10-17', 'active',    '2026-10-17', 1, '2026-05-01'),
    (24, '2024-04-25', 'active',    '2025-04-25', 0, '2025-04-25'),
    (25, '2022-07-30', 'active',    '2026-07-30', 1, '2026-04-01');
