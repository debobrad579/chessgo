-- +goose Up
CREATE TABLE lichess_accounts (
    user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    linked_at timestamp NOT NULL,
    id text NOT NULL,
    username text NOT NULL,
    encrypted_token bytea NOT NULL
);

-- +goose Down
DROP TABLE lichess_accounts;

