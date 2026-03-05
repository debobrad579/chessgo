package games

import (
	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/gorilla/websocket"
)

type PlayerRole string

const (
	White     PlayerRole = "w"
	Black     PlayerRole = "b"
	Spectator PlayerRole = "n"
)

func (room *GameRoom) assignRole(conn *websocket.Conn, user *database.User) PlayerRole {
	switch {
	case user.ID == room.game.White.ID:
		room.white.conn = conn
		return White
	case user.ID == room.game.Black.ID:
		room.black.conn = conn
		return Black
	case room.white.conn == nil:
		room.game.White = chess.Player{ID: user.ID, Name: user.Name}
		room.white.conn = conn
		room.black.isGuest = user.Email == ""
		if room.black.conn != nil {
			room.startTurnTimer()
			registry.notifySubscribers()
		}
		return White
	case room.black.conn == nil:
		room.game.Black = chess.Player{ID: user.ID, Name: user.Name}
		room.black.conn = conn
		room.black.isGuest = user.Email == ""
		if room.white.conn != nil {
			room.startTurnTimer()
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
