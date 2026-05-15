-- 🏗️ MAD-ERP ENTERPRISE PHASE 5: Material Requisitions
-- Workflow for Field supervisors to request materials from HQ.

CREATE TABLE material_requisitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    inventory_item_id BIGINT,
    custom_item_name VARCHAR(150),
    quantity DOUBLE NOT NULL,
    unit_of_measure VARCHAR(20),
    urgency VARCHAR(15) DEFAULT 'NORMAL', -- NORMAL, URGENT, CRITICAL
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, DISPATCHED, RECEIVED
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_req_project FOREIGN KEY (project_id) REFERENCES projects(id),
    CONSTRAINT fk_req_user FOREIGN KEY (requester_id) REFERENCES users(id),
    CONSTRAINT fk_req_inventory FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);
