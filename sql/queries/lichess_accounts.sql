-- name: LinkLichessAccount :one
INSERT INTO lichess_accounts (user_id, linked_at, id, username, encrypted_token)
    VALUES ($1, NOW(), $2, $3, $4)
RETURNING
    *;

-- name: GetLichessAccount :one
SELECT
    *
FROM
    lichess_accounts
WHERE
    user_id = $1;

