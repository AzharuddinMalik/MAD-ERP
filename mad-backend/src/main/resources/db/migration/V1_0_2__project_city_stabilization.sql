-- Safe column addition
ALTER TABLE projects ADD COLUMN city_id BIGINT;

-- Backfill NULLs to prevent NOT NULL constraint failure during deployment
UPDATE projects SET city_id = (SELECT id FROM cities LIMIT 1) WHERE city_id IS NULL;

-- Enforce constraints & indexing
ALTER TABLE projects MODIFY COLUMN city_id BIGINT NOT NULL;

-- Note: The FK constraint might already exist with a different name if Hibernate created it.
-- We check for project-city FK carefully or just apply it.
ALTER TABLE projects ADD CONSTRAINT fk_projects_city 
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX idx_projects_city_id ON projects(city_id);
