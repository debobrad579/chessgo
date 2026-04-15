-- name: CreateGame :one
INSERT INTO games (id, created_at, updated_at, white_id, black_id, time_control_base, time_control_increment, result, moves)
    VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7)
RETURNING
    *;

-- name: GetGamesByUser :many
SELECT
    g.id,
    g.white_id,
    wu.name AS white_name,
    g.black_id,
    bu.name AS black_name,
    g.time_control_base,
    g.time_control_increment,
    g.result
FROM
    games g
    LEFT JOIN users wu ON g.white_id = wu.id
    LEFT JOIN users bu ON g.black_id = bu.id
WHERE
    g.white_id IS NOT DISTINCT FROM sqlc.arg (id)
    OR g.black_id IS NOT DISTINCT FROM sqlc.arg (id)
ORDER BY
    g.created_at DESC,
    g.id DESC
LIMIT sqlc.arg (page_size)
OFFSET (sqlc.arg (page_number)::int - 1) * sqlc.arg (page_size);

-- name: GetGame :one
SELECT
    g.*,
    wu.name AS white_name,
    bu.name AS black_name
FROM
    games g
    LEFT JOIN users wu ON g.white_id = wu.id
    LEFT JOIN users bu ON g.black_id = bu.id
WHERE
    g.id = $1;

-- name: GetGamesCount :one
SELECT
    COUNT(*)
FROM
    games
WHERE
    white_id IS NOT DISTINCT FROM $1
    OR black_id IS NOT DISTINCT FROM $1;

