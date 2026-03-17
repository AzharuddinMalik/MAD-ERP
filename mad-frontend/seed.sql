USE madcms;
CREATE TABLE roles ( id BIGINT NOT NULL AUTO_INCREMENT, name VARCHAR(255) NOT NULL, PRIMARY KEY (id)) ENGINE=InnoDB;
CREATE TABLE users ( id BIGINT NOT NULL AUTO_INCREMENT, full_name VARCHAR(255), is_active BIT, password_hash VARCHAR(255) NOT NULL, project_count BIGINT, username VARCHAR(255) NOT NULL, role_id BIGINT, PRIMARY KEY (id)) ENGINE=InnoDB;
ALTER TABLE roles ADD CONSTRAINT UK_nb4h0p6txrmfc0xbrd1kglp9t UNIQUE (name);
ALTER TABLE users ADD CONSTRAINT UK_r43af9ap4edm43mmtq01oddj6 UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT FKp56c1712k691lhsyewcssf40f FOREIGN KEY (role_id) REFERENCES roles (id);
INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');
INSERT INTO users (username, password_hash, role_id, is_active) VALUES ('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 1, 1);
