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
    JOIN users wu ON g.white_id = wu.id
    JOIN users bu ON g.black_id = bu.id
WHERE
    g.white_id = $1
    OR g.black_id = $1
ORDER BY
    g.created_at DESC,
    g.id DESC
LIMIT $2 OFFSET ($3 - 1) * $2;

-- name: GetGame :one
SELECT
    g.*,
    wu.name AS white_name,
    bu.name AS black_name
FROM
    games g
    JOIN users wu ON g.white_id = wu.id
    JOIN users bu ON g.black_id = bu.id
WHERE
    g.id = $1;

