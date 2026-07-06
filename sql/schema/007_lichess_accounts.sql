-- +goose Up
CREATE TABLE lichess_accounts (
    user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    id text NOT NULL,
    username text NOT NULL,
    encrypted_token bytea NOT NULL,
    linked_at timestamp NOT NULL,
    expires_at timestamp NOT NULL
);

-- +goose Down
DROP TABLE lichess_accounts;

