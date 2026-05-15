-- V7: Enterprise Scaling Schema
-- Author: Antigravity AI
-- Description: Adds BusinessUnit, Branch, Inventory, and Vendor layers for multi-tenant enterprise support.

-- 1. Business Units (Organization Level)
CREATE TABLE IF NOT EXISTS business_units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    registration_number VARCHAR(50),
    is_active BIT(1) DEFAULT 1,
    created_at DATETIME(6)
) ENGINE=InnoDB;

-- 2. Branches (Office/Regional Level)
CREATE TABLE IF NOT EXISTS branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    business_unit_id BIGINT NOT NULL,
    is_active BIT(1) DEFAULT 1,
    created_at DATETIME(6),
    CONSTRAINT fk_branch_business_unit FOREIGN KEY (business_unit_id) REFERENCES business_units(id)
) ENGINE=InnoDB;

-- 3. Inventory Items (Materials)
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    unit_of_measure VARCHAR(20),
    minimum_stock_level DOUBLE DEFAULT 0.0,
    created_at DATETIME(6)
) ENGINE=InnoDB;

-- 4. Vendors (Suppliers)
CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(255),
    is_active BIT(1) DEFAULT 1,
    created_at DATETIME(6)
) ENGINE=InnoDB;

-- 5. Link Projects to Branches (Optional: We will add the column to projects later or leave as is for now)
-- ALTER TABLE projects ADD COLUMN branch_id BIGINT;
-- ALTER TABLE projects ADD CONSTRAINT fk_project_branch FOREIGN KEY (branch_id) REFERENCES branches(id);
