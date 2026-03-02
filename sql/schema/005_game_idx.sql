-- +goose Up
CREATE INDEX idx_games_white_created ON games (white_id, created_at DESC, id DESC);

CREATE INDEX idx_games_black_created ON games (black_id, created_at DESC, id DESC);

-- +goose Down
DROP INDEX IF EXISTS idx_games_white_created;

DROP INDEX IF EXISTS idx_games_black_created;

