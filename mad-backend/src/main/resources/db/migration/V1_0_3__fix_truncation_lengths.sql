-- Migration to fix truncation issues in AuditLog and Projects tables
-- V1_0_3__fix_truncation_lengths.sql

-- Increase method length in audit_logs to handle "PROJECT_INVOICED"
ALTER TABLE audit_logs MODIFY COLUMN method VARCHAR(50) NOT NULL;

-- Ensure status length in projects is safe
ALTER TABLE projects MODIFY COLUMN status VARCHAR(50);
