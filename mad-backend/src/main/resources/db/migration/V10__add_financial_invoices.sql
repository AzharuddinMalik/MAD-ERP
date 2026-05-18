-- V10: Create project_invoices, vendor_invoices, and vendor_invoice_items tables
-- Author: Antigravity AI
-- Description: Adds database tables for Phase Four and Five invoice management.

CREATE TABLE IF NOT EXISTS project_invoices (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    generated_at TIMESTAMP,
    CONSTRAINT fk_project_invoice_project FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS vendor_invoices (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    invoice_date TIMESTAMP,
    due_date TIMESTAMP,
    payment_terms VARCHAR(255),
    gst_breakdown TEXT,
    total_amount NUMERIC(38,2),
    status VARCHAR(20) DEFAULT 'DRAFT',
    generated_at TIMESTAMP,
    CONSTRAINT fk_vendor_invoice_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

CREATE TABLE IF NOT EXISTS vendor_invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    requisition_id BIGINT NOT NULL,
    amount NUMERIC(38,2),
    description VARCHAR(255),
    CONSTRAINT fk_vii_invoice FOREIGN KEY (invoice_id) REFERENCES vendor_invoices(id),
    CONSTRAINT fk_vii_requisition FOREIGN KEY (requisition_id) REFERENCES material_requisitions(id)
);
