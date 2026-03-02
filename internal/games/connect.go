package games

import (
	"net/http"

	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/database"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (room *GameRoom) Connect(w http.ResponseWriter, r *http.Request, user *database.User) (*websocket.Conn, PlayerRole) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "failed to upgrade websocket", http.StatusBadRequest)
		return nil, Spectator
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	playerRole := room.assignRole(conn, user)

	if playerRole != Spectator {
		select {
		case room.broadcast <- struct{}{}:
		default:
		}
	}

	return conn, playerRole
}

func (room *GameRoom) Disconnect(user *database.User) {
	room.mu.Lock()

	switch {
	case room.spectatorConns[user.ID] != nil:
		room.spectatorConns[user.ID].Close()
		delete(room.spectatorConns, user.ID)
	case room.whiteConn != nil && user.ID == room.game.White.ID:
		room.whiteConn.Close()
		room.whiteConn = nil
	case room.blackConn != nil && user.ID == room.game.Black.ID:
		room.blackConn.Close()
		room.blackConn = nil
	}

	roomEmpty := room.whiteConn == nil && room.blackConn == nil

	if roomEmpty {
		room.turnTimer.Stop()
		close(room.broadcast)
	}

	room.mu.Unlock()

	if roomEmpty {
		registry.mu.Lock()
		delete(registry.rooms, room.id)
		registry.mu.Unlock()
		registry.notifySubscribers()
	}
}
