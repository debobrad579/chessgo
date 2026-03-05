-- +goose Up
ALTER TABLE games
    ALTER COLUMN white_id DROP NOT NULL;

ALTER TABLE games
    ALTER COLUMN black_id DROP NOT NULL;

-- +goose Down
ALTER TABLE games
    ALTER COLUMN white_id SET NOT NULL;

ALTER TABLE games
    ALTER COLUMN black_id SET NOT NULL;

