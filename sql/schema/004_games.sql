-- +goose Up
CREATE TABLE games (
    id uuid PRIMARY KEY,
    created_at timestamp NOT NULL,
    updated_at timestamp NOT NULL,
    white_id uuid NOT NULL REFERENCES users (id),
    black_id uuid NOT NULL REFERENCES users (id),
    time_control_base integer NOT NULL,
    time_control_increment integer NOT NULL,
    result text NOT NULL,
    moves jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- +goose Down
DROP TABLE games;

