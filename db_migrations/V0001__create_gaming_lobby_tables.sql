CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    avatar_emoji VARCHAR(10) DEFAULT '🎮',
    level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'online',
    team_id INTEGER NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100) UNIQUE
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lobby_state (
    id SERIAL PRIMARY KEY,
    game_started BOOLEAN DEFAULT FALSE,
    max_players INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO teams (name, color) VALUES 
('Команда А', 'neon-green'),
('Команда Б', 'neon-purple');

INSERT INTO lobby_state (game_started, max_players) VALUES (FALSE, 10);