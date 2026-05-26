package bot

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Connect(w http.ResponseWriter, r *http.Request, userID uuid.UUID, color chess.Color) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "failed to upgrade websocket", http.StatusBadRequest)
		return nil
	}

	room, ok := getRoom(userID)
	if !ok {
		room = createGame(userID, color)
	}

	room.userConn = conn

	room.stopDisconnectTimer()
	room.sendGameData()

	return conn
}

func Disconnect(userID uuid.UUID) {
	room, ok := getRoom(userID)

	if ok {
		room.startDisconnectTimer(60 * time.Second)

		if room.userConn != nil {
			room.userConn.Close()
			room.userConn = nil
		}
	}
}
