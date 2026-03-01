-- Fix for 500 Internal Server error when fetching events
-- Adding the missing column that Sequelize is expecting but is missing in the database schema
SET search_path TO drista_csr;
ALTER TABLE events
ADD COLUMN IF NOT EXISTS is_only_volunteers BOOLEAN DEFAULT FALSE;