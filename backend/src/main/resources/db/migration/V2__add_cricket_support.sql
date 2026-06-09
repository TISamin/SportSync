-- ==========================================
-- V2: Add Cricket Support
-- ==========================================

-- Alter existing tables to support cricket
ALTER TABLE tournament ADD COLUMN sport VARCHAR(20) NOT NULL DEFAULT 'FOOTBALL';
ALTER TABLE match_fixture ADD COLUMN sport VARCHAR(20) NOT NULL DEFAULT 'FOOTBALL';
ALTER TABLE match_fixture ADD COLUMN overs INT DEFAULT NULL;
ALTER TABLE standing ADD COLUMN tied INT NOT NULL DEFAULT 0;
ALTER TABLE standing ADD COLUMN no_result INT NOT NULL DEFAULT 0;
ALTER TABLE standing ADD COLUMN nrr DOUBLE NOT NULL DEFAULT 0.0;

-- 1. Table: innings
CREATE TABLE innings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    innings_number INT NOT NULL,
    batting_team_id BIGINT NOT NULL,
    bowling_team_id BIGINT NOT NULL,
    total_runs INT NOT NULL DEFAULT 0,
    total_wickets INT NOT NULL DEFAULT 0,
    total_overs_bowled DOUBLE NOT NULL DEFAULT 0.0,
    extras INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    is_super_over BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_innings_match FOREIGN KEY (match_id) REFERENCES match_fixture(id) ON DELETE CASCADE,
    CONSTRAINT fk_innings_batting_team FOREIGN KEY (batting_team_id) REFERENCES team(id) ON DELETE CASCADE,
    CONSTRAINT fk_innings_bowling_team FOREIGN KEY (bowling_team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table: ball_event
CREATE TABLE ball_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    innings_id BIGINT NOT NULL,
    over_number INT NOT NULL,
    ball_number INT NOT NULL,
    bowler_id BIGINT NOT NULL,
    striker_id BIGINT NOT NULL,
    non_striker_id BIGINT NOT NULL,
    outcome VARCHAR(30) NOT NULL,
    extra_runs INT NOT NULL DEFAULT 0,
    is_legal_delivery BOOLEAN NOT NULL DEFAULT TRUE,
    free_hit_next BOOLEAN NOT NULL DEFAULT FALSE,
    dismissal_type VARCHAR(30) DEFAULT NULL,
    dismissed_player_id BIGINT DEFAULT NULL,
    CONSTRAINT fk_ball_innings FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    CONSTRAINT fk_ball_bowler FOREIGN KEY (bowler_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_ball_striker FOREIGN KEY (striker_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_ball_non_striker FOREIGN KEY (non_striker_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_ball_dismissed FOREIGN KEY (dismissed_player_id) REFERENCES player(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table: batting_scorecard
CREATE TABLE batting_scorecard (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    innings_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    runs INT NOT NULL DEFAULT 0,
    balls_faced INT NOT NULL DEFAULT 0,
    fours INT NOT NULL DEFAULT 0,
    sixes INT NOT NULL DEFAULT 0,
    dismissal_type VARCHAR(30) DEFAULT NULL,
    dismissed_by_id BIGINT DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_YET_BATTED',
    CONSTRAINT fk_batting_innings FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    CONSTRAINT fk_batting_player FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_batting_dismissed_by FOREIGN KEY (dismissed_by_id) REFERENCES player(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table: bowling_scorecard
CREATE TABLE bowling_scorecard (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    innings_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    overs_bowled INT NOT NULL DEFAULT 0,
    balls_bowled INT NOT NULL DEFAULT 0,
    runs_conceded INT NOT NULL DEFAULT 0,
    wickets INT NOT NULL DEFAULT 0,
    wides INT NOT NULL DEFAULT 0,
    no_balls INT NOT NULL DEFAULT 0,
    maidens INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_bowling_innings FOREIGN KEY (innings_id) REFERENCES innings(id) ON DELETE CASCADE,
    CONSTRAINT fk_bowling_player FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table: cricket_match_state
CREATE TABLE cricket_match_state (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL UNIQUE,
    innings_number INT NOT NULL DEFAULT 1,
    striker_id BIGINT DEFAULT NULL,
    non_striker_id BIGINT DEFAULT NULL,
    current_bowler_id BIGINT DEFAULT NULL,
    legal_balls_in_current_over INT NOT NULL DEFAULT 0,
    is_free_hit_next BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) NOT NULL DEFAULT 'TOSS',
    toss_winner_id BIGINT DEFAULT NULL,
    toss_decision VARCHAR(10) DEFAULT NULL,
    CONSTRAINT fk_state_match FOREIGN KEY (match_id) REFERENCES match_fixture(id) ON DELETE CASCADE,
    CONSTRAINT fk_state_striker FOREIGN KEY (striker_id) REFERENCES player(id) ON DELETE SET NULL,
    CONSTRAINT fk_state_non_striker FOREIGN KEY (non_striker_id) REFERENCES player(id) ON DELETE SET NULL,
    CONSTRAINT fk_state_bowler FOREIGN KEY (current_bowler_id) REFERENCES player(id) ON DELETE SET NULL,
    CONSTRAINT fk_state_toss_winner FOREIGN KEY (toss_winner_id) REFERENCES team(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table: tournament_player_stat
CREATE TABLE tournament_player_stat (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    total_runs INT NOT NULL DEFAULT 0,
    total_balls_faced INT NOT NULL DEFAULT 0,
    total_fours INT NOT NULL DEFAULT 0,
    total_sixes INT NOT NULL DEFAULT 0,
    total_wickets INT NOT NULL DEFAULT 0,
    total_overs_bowled INT NOT NULL DEFAULT 0,
    total_runs_conceded INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_tps_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    CONSTRAINT fk_tps_player FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_tps_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
