-- Initial baseline schema for clean production deployments.
-- Matches the original Hibernate-generated schema exactly (pre-migration V1.0.2).

CREATE TABLE IF NOT EXISTS cities (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    state VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN,
    role_id BIGINT,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    labour_count INTEGER NOT NULL DEFAULT 0,
    start_date DATE,
    status VARCHAR(255),
    supervisor_id BIGINT,
    created_at TIMESTAMP,
    CONSTRAINT fk_projects_supervisor FOREIGN KEY (supervisor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS labour (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255),
    daily_wage DOUBLE PRECISION,
    is_active BOOLEAN,
    project_id BIGINT,
    CONSTRAINT fk_labour_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    status VARCHAR(255) NOT NULL,
    labour_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    CONSTRAINT fk_attendance_labour FOREIGN KEY (labour_id) REFERENCES labour(id),
    CONSTRAINT fk_attendance_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS bill_of_quantities (
    id BIGSERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    unit VARCHAR(255),
    rate DOUBLE PRECISION NOT NULL,
    total_scope DOUBLE PRECISION NOT NULL,
    completed_scope DOUBLE PRECISION NOT NULL DEFAULT 0,
    gst_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
    material_required_per_unit DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_material_used DOUBLE PRECISION,
    last_updated TIMESTAMP,
    project_id BIGINT NOT NULL,
    CONSTRAINT fk_boq_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS daily_measurements (
    id BIGSERIAL PRIMARY KEY,
    date DATE,
    length DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    remarks TEXT,
    supervisor_name VARCHAR(255),
    boq_id BIGINT NOT NULL,
    CONSTRAINT fk_dm_boq FOREIGN KEY (boq_id) REFERENCES bill_of_quantities(id)
);

CREATE TABLE IF NOT EXISTS site_updates (
    id SERIAL PRIMARY KEY,
    content TEXT,
    photo_url_1 VARCHAR(255),
    photo_url_2 VARCHAR(255),
    update_time TIMESTAMP,
    project_id BIGINT NOT NULL,
    CONSTRAINT fk_site_updates_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS lead_inquiries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(255),
    service_needed VARCHAR(255),
    message VARCHAR(1000),
    source VARCHAR(255),
    status VARCHAR(255),
    whatsapp_consent BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    method VARCHAR(10) NOT NULL,
    uri VARCHAR(255) NOT NULL,
    status INTEGER NOT NULL,
    duration BIGINT NOT NULL,
    client_ip VARCHAR(45),
    timestamp TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_uri ON audit_logs(uri);

-- Seed initial basic data (roles and super admin user)
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO users (username, password_hash, role_id, is_active) 
VALUES ('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 1, TRUE)
ON CONFLICT DO NOTHING;
