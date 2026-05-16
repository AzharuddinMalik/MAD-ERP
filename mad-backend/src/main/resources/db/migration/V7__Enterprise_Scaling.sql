-- V7: Enterprise Scaling Schema
-- Author: Antigravity AI
-- Description: Adds BusinessUnit, Branch, Inventory, and Vendor layers for multi-tenant enterprise support.

-- 1. Business Units (Organization Level)
CREATE TABLE IF NOT EXISTS business_units (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    registration_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);

-- 2. Branches (Office/Regional Level)
CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    business_unit_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    CONSTRAINT fk_branch_business_unit FOREIGN KEY (business_unit_id) REFERENCES business_units(id)
);

-- 3. Inventory Items (Materials)
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit_of_measure VARCHAR(20),
    minimum_stock_level DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP
);

-- 4. Vendors (Suppliers)
CREATE TABLE IF NOT EXISTS vendors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
);

-- 5. Link Projects to Branches (Optional: We will add the column to projects later or leave as is for now)
-- ALTER TABLE projects ADD COLUMN branch_id BIGINT;
-- ALTER TABLE projects ADD CONSTRAINT fk_project_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
