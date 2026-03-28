/* create socio table (with their personal information) 
    This datatype merely describes the socio (a person)
*/
CREATE TABLE IF NOT EXISTS socio (  
    id INTEGER PRIMARY KEY AUTOINCREMENT,  
    name TEXT NOT NULL,  
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    nss TEXT
);

/* create socio_state table (with their adherence status) 
    This datatype keeps track of a "socio"s state of membership
*/
CREATE TABLE IF NOT EXISTS socio_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partner_id INTEGER NOT NULL UNIQUE, -- UNIQUENESS ENSURES ONLY ONE RECORD PER SOCIO (enforces 1-to-1 ; without it, 1(socio)-to-many(socio_status))
    joined_at DATE NOT NULL,
    status TEXT NOT NULL, -- active, inactive, suspended
    paid_until DATE NOT NULL,   -- until next year
    board_store BOOL NOT NULL,  -- guardaria?
    store_paid_until DATE NOT NULL,  -- guardiaria ? unti next month : unused
    FOREIGN KEY (partner_id) REFERENCES socio(id) ON DELETE CASCADE
);