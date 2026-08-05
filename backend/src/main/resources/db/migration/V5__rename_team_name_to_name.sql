-- ========================================================
-- V5: Rename team_name column back to name
-- (V4 used DELIMITER which Flyway cannot execute, 
--  so the rename never actually happened)
-- ========================================================

ALTER TABLE team CHANGE team_name name VARCHAR(100) NOT NULL;
