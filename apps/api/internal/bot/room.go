package bot

import (
	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type GameRoom struct {
	UserID      uuid.UUID
	userConn    *websocket.Conn
	playerColor chess.Color
	game        *chess.Game
	result      chess.GameOver
}

type gamesRegistry struct {
	rooms map[uuid.UUID]*GameRoom
}

var registry = gamesRegistry{
	rooms: make(map[uuid.UUID]*GameRoom),
}
