ALTER TABLE players ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

UPDATE players SET is_admin = TRUE WHERE username = 'neflixxx666';