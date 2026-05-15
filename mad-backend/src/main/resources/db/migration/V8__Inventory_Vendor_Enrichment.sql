-- 🏗️ MAD-ERP ENTERPRISE PHASE 4: Inventory & Vendor Enrichment
-- Enhancing schema for Project-level inventory tracking and vendor financial details.

-- 1. ENRICH INVENTORY ITEMS
ALTER TABLE inventory_items 
ADD COLUMN current_quantity DOUBLE DEFAULT 0.0,
ADD COLUMN project_id BIGINT,
ADD COLUMN vendor_id BIGINT,
ADD COLUMN description VARCHAR(255),
ADD CONSTRAINT fk_inventory_project FOREIGN KEY (project_id) REFERENCES projects(id),
ADD CONSTRAINT fk_inventory_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id);

-- 2. ENRICH VENDORS
ALTER TABLE vendors
ADD COLUMN gst_number VARCHAR(20),
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN account_number VARCHAR(30),
ADD COLUMN ifsc_code VARCHAR(15),
ADD COLUMN payment_terms VARCHAR(100);
