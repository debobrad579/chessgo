package games

import (
	"time"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/gorilla/websocket"
)

type PlayerRole int

const (
	White PlayerRole = iota
	Black
	Spectator
)

func (room *GameRoom) assignRole(conn *websocket.Conn, user *database.User) PlayerRole {
	switch {
	case user.ID == room.game.White.ID:
		room.whiteConn = conn
		return White
	case user.ID == room.game.Black.ID:
		room.blackConn = conn
		return Black
	case room.whiteConn == nil:
		room.game.White = chess.Player{ID: user.ID, Name: user.Name}
		room.whiteConn = conn
		if room.blackConn != nil {
			room.turnStart = time.Now()
			registry.notifySubscribers()
		}
		return White
	case room.blackConn == nil:
		room.game.Black = chess.Player{ID: user.ID, Name: user.Name}
		room.blackConn = conn
		if room.whiteConn != nil {
			room.turnStart = time.Now()
			registry.notifySubscribers()
		}
		return Black
	default:
		data, err := room.getGameData()
		if err != nil {
			return Spectator
		}
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			conn.Close()
			return Spectator
		}
		room.spectatorConns[user.ID] = conn
		return Spectator
	}
}
