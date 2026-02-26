package games

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type gameRoom struct {
	game      *chess.Game
	whiteConn *websocket.Conn
	blackConn *websocket.Conn
	whiteTime int
	blackTime int
	mu        sync.Mutex
	broadcast chan struct{}
	turnStart time.Time
	thinkTime int
}

type gamesRegistry struct {
	mu    sync.Mutex
	rooms map[uuid.UUID]*gameRoom
}

var registry = gamesRegistry{
	rooms: make(map[uuid.UUID]*gameRoom),
}

type GameReturnType struct {
	Game      *chess.Game `json:"game"`
	ThinkTime int         `json:"think_time"`
}
