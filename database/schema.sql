




CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) DEFAULT '',
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    vehicle_type    VARCHAR(50)  DEFAULT 'Patineta',
    role            VARCHAR(20)  DEFAULT 'user',
    reset_token     VARCHAR(255),
    reset_token_expires TIMESTAMP,
    is_verified     BOOLEAN      DEFAULT true,
    verification_code VARCHAR(10),
    points          INTEGER      DEFAULT 0,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS bays (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    status          VARCHAR(20)  DEFAULT 'available',
    vehicle_type    VARCHAR(50)  DEFAULT 'Patineta',
    location        VARCHAR(255) DEFAULT 'Zona principal',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS reservations (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bay_id              INTEGER NOT NULL REFERENCES bays(id) ON DELETE CASCADE,
    reservation_code    VARCHAR(50) NOT NULL UNIQUE,
    arrival_time        VARCHAR(50) NOT NULL,
    duration            VARCHAR(50) NOT NULL,
    status              VARCHAR(20) DEFAULT 'active',
    qr_data             TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS car_spots (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    zone            VARCHAR(50)  DEFAULT 'Zona A',
    status          VARCHAR(20)  DEFAULT 'free',  
    sensor_id       VARCHAR(50),                   
    sensor_active   BOOLEAN      DEFAULT true,
    last_updated    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO car_spots (code, zone, status, sensor_id) VALUES
    ('C-01', 'Zona A', 'free',  'SENS-A01'),
    ('C-02', 'Zona A', 'free',  'SENS-A02'),
    ('C-03', 'Zona A', 'free',  'SENS-A03'),
    ('C-04', 'Zona A', 'free',  'SENS-A04'),
    ('C-05', 'Zona B', 'free',  'SENS-B01'),
    ('C-06', 'Zona B', 'free',  'SENS-B02'),
    ('C-07', 'Zona B', 'free',  'SENS-B03'),
    ('C-08', 'Zona B', 'free',  'SENS-B04'),
    ('C-09', 'Zona C', 'free',  'SENS-C01'),
    ('C-10', 'Zona C', 'free',  'SENS-C02'),
    ('C-11', 'Zona C', 'free',  'SENS-C03'),
    ('C-12', 'Zona C', 'free',  'SENS-C04')
ON CONFLICT (code) DO NOTHING;


CREATE TABLE IF NOT EXISTS station (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    address         TEXT NOT NULL,
    opening_hours   VARCHAR(255) NOT NULL,
    latitude        NUMERIC,
    longitude       NUMERIC,
    description     TEXT DEFAULT ''
);






INSERT INTO bays (code, status, vehicle_type, location) VALUES
    ('P1', 'available', 'Universal', 'Puerto 1 - Zona Solar'),
    ('P2', 'available', 'Universal', 'Puerto 2 - Zona Solar'),
    ('P3', 'available', 'Universal', 'Puerto 3 - Zona Solar'),
    ('P4', 'available', 'Universal', 'Puerto 4 - Zona Solar'),
    ('P5', 'available', 'Universal', 'Puerto 5 - Zona Solar'),
    ('P6', 'available', 'Universal', 'Puerto 6 - Zona Solar'),
    ('P7', 'available', 'Universal', 'Puerto 7 - Zona Solar'),
    ('P8', 'available', 'Universal', 'Puerto 8 - Zona Solar')
ON CONFLICT (code) DO NOTHING;


DELETE FROM bays
    WHERE code IN ('A1','A2','A3','A4','B1','B2','B3','B4')
    AND id NOT IN (SELECT DISTINCT bay_id FROM reservations WHERE bay_id IS NOT NULL);


UPDATE bays SET vehicle_type = 'Universal' WHERE vehicle_type != 'Universal';


INSERT INTO station (id, name, address, opening_hours, latitude, longitude, description) VALUES
    (1,
     'SolCarga Campus Central',
     'Universidad / Campus Principal, Edificio de Ingeniería',
     'Lunes a Viernes: 6:00 AM - 10:00 PM | Sábados: 8:00 AM - 6:00 PM',
     6.2442,
     -75.5812,
     'Estación de carga solar inteligente para vehículos eléctricos livianos. Alimentada 100% por paneles solares.')
ON CONFLICT (id) DO NOTHING;


INSERT INTO users (name, last_name, email, password_hash, role) VALUES
    ('Anderson', 'Admin', 'andermonmon@gmail.com', '$2b$10$t8aeWfHyC5c2jqC7H2fO3e2w6kBfppzdlNLCKZjmY88avUZo6ytu6', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';


UPDATE users SET role = 'user' WHERE email != 'andermonmon@gmail.com' AND role = 'admin';


ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255), 
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP, 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT true, 
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo TEXT DEFAULT NULL;
