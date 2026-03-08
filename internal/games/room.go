package games

import (
	"errors"
	"sync"
	"sync/atomic"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
)

type playerInfo struct {
	conn    *websocket.Conn
	time    int
	isGuest bool
}

type GameRoom struct {
	id               uuid.UUID
	game             *chess.Game
	white            playerInfo
	black            playerInfo
	result           chess.GameOver
	mu               sync.Mutex
	broadcast        chan struct{}
	spectatorConns   map[uuid.UUID]*websocket.Conn
	turnStart        time.Time
	turnTimer        *time.Timer
	db               *database.Queries
	pendingDrawOffer PlayerRole
	rematchRequest   PlayerRole
	rematchGameID    uuid.UUID
	gameStarted      atomic.Bool
	disconnectTimer  *time.Timer
}

func (room *GameRoom) whiteExists() bool {
	return room.game.White.ID != uuid.Nil
}

func (room *GameRoom) blackExists() bool {
	return room.game.Black.ID != uuid.Nil
}

func GetGameRoom(gameID uuid.UUID) (*GameRoom, error) {
	registry.mu.Lock()
	room, ok := registry.rooms[gameID]
	registry.mu.Unlock()

	if !ok {
		return nil, errors.New("game room not found")
	}

	return room, nil
}
