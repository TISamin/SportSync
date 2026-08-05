-- ========================================================
-- V4: Rename team_name column back to name
-- ========================================================

ALTER TABLE team CHANGE team_name name VARCHAR(100) NOT NULL;
