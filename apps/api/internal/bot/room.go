package bot

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type gameRoom struct {
	userID          uuid.UUID
	connections     []*websocket.Conn
	game            *chess.Game
	result          chess.GameOver
	disconnectTimer *time.Timer
	mu              sync.Mutex
}

type gamesRegistry struct {
	rooms map[uuid.UUID]*gameRoom
	mu    sync.Mutex
}

var registry = gamesRegistry{
	rooms: make(map[uuid.UUID]*gameRoom),
}

func getRoom(userID uuid.UUID) (*gameRoom, bool) {
	registry.mu.Lock()
	room, ok := registry.rooms[userID]
	registry.mu.Unlock()
	return room, ok
}

func (room *gameRoom) getUserColor(userID uuid.UUID) chess.Color {
	if room.game.White.ID == userID {
		return chess.White
	}

	return chess.Black
}
