-- ========================================================
-- V4: Safe migration to ensure team column is 'name'
-- ========================================================

DELIMITER //

CREATE PROCEDURE FixTeamColumnName()
BEGIN
    IF EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team' AND COLUMN_NAME = 'team_name'
    ) AND NOT EXISTS (
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'team' AND COLUMN_NAME = 'name'
    ) THEN
        ALTER TABLE team CHANGE team_name name VARCHAR(100) NOT NULL;
    END IF;
END //

DELIMITER ;

CALL FixTeamColumnName();
DROP PROCEDURE IF EXISTS FixTeamColumnName;
