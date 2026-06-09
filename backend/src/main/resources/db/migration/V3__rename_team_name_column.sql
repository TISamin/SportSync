-- ===========================
-- V3: Rename team name column
-- ===========================

ALTER TABLE team CHANGE name team_name VARCHAR(100) NOT NULL;
