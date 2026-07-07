-- name: LinkLichessAccount :one
INSERT INTO lichess_accounts (user_id, id, username, encrypted_token, linked_at, expires_at)
    VALUES ($1, $2, $3, $4, NOW(), $5)
RETURNING
    *;

-- name: GetLichessAccount :one
SELECT
    *
FROM
    lichess_accounts
WHERE
    user_id = $1;

-- name: UnlinkLichessAccount :one
DELETE FROM lichess_accounts
WHERE user_id = $1
RETURNING
    *;

