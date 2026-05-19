-- ===========================
-- V1: Create all 10 tables
-- ===========================

CREATE TABLE auction_room (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(6) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    budget_per_team INT NOT NULL,
    max_teams INT NOT NULL DEFAULT 8,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE player (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_room_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT,
    role VARCHAR(30) NOT NULL,
    style VARCHAR(50),
    category VARCHAR(5) NOT NULL,
    image_url VARCHAR(500),
    player_number INT,
    base_price INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_player_auction_room FOREIGN KEY (auction_room_id) REFERENCES auction_room(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE team (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    auction_room_id BIGINT,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    budget_remaining INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_team_auction_room FOREIGN KEY (auction_room_id) REFERENCES auction_room(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE team_player (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    sold_price INT NOT NULL DEFAULT 0,
    acquired_via VARCHAR(20) NOT NULL DEFAULT 'BID',
    CONSTRAINT fk_team_player_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_player_player FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tournament (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'SINGLE',
    current_phase INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    auction_room_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tournament_auction_room FOREIGN KEY (auction_room_id) REFERENCES auction_room(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tournament_team (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    phase_number INT NOT NULL DEFAULT 1,
    group_number INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_tournament_team_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    CONSTRAINT fk_tournament_team_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE match_fixture (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    home_team_id BIGINT NOT NULL,
    away_team_id BIGINT NOT NULL,
    phase_number INT NOT NULL DEFAULT 1,
    group_number INT NOT NULL DEFAULT 1,
    round VARCHAR(20) NOT NULL DEFAULT 'GROUP',
    home_score INT,
    away_score INT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    played_at TIMESTAMP NULL,
    CONSTRAINT fk_match_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_home_team FOREIGN KEY (home_team_id) REFERENCES team(id) ON DELETE CASCADE,
    CONSTRAINT fk_match_away_team FOREIGN KEY (away_team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE match_event (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    match_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    minute INT NOT NULL,
    CONSTRAINT fk_event_match FOREIGN KEY (match_id) REFERENCES match_fixture(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_player FOREIGN KEY (player_id) REFERENCES player(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE standing (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    phase_number INT NOT NULL DEFAULT 1,
    group_number INT NOT NULL DEFAULT 1,
    played INT NOT NULL DEFAULT 0,
    won INT NOT NULL DEFAULT 0,
    drawn INT NOT NULL DEFAULT 0,
    lost INT NOT NULL DEFAULT 0,
    goals_for INT NOT NULL DEFAULT 0,
    goals_against INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_standing_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    CONSTRAINT fk_standing_team FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE tournament_result (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT NOT NULL,
    winner_team_id BIGINT,
    runner_up_team_id BIGINT,
    second_runner_id BIGINT,
    top_scorer_id BIGINT,
    top_assister_id BIGINT,
    CONSTRAINT fk_result_tournament FOREIGN KEY (tournament_id) REFERENCES tournament(id) ON DELETE CASCADE,
    CONSTRAINT fk_result_winner FOREIGN KEY (winner_team_id) REFERENCES team(id) ON DELETE SET NULL,
    CONSTRAINT fk_result_runner FOREIGN KEY (runner_up_team_id) REFERENCES team(id) ON DELETE SET NULL,
    CONSTRAINT fk_result_second FOREIGN KEY (second_runner_id) REFERENCES team(id) ON DELETE SET NULL,
    CONSTRAINT fk_result_scorer FOREIGN KEY (top_scorer_id) REFERENCES player(id) ON DELETE SET NULL,
    CONSTRAINT fk_result_assister FOREIGN KEY (top_assister_id) REFERENCES player(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
