package bot

import (
	"math/rand/v2"
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

func Connect(w http.ResponseWriter, r *http.Request, userID uuid.UUID) *websocket.Conn {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "failed to upgrade websocket", http.StatusBadRequest)
		return nil
	}

	room, ok := getRoom(userID)
	if !ok {
		color := chess.White
		if rand.IntN(2) == 1 {
			color = chess.Black
		}

		room = createGame(userID, color)
	}

	room.mu.Lock()
	room.connections = append(room.connections, conn)
	room.stopDisconnectTimer()
	room.sendGameData()
	room.mu.Unlock()

	return conn
}

func Disconnect(userID uuid.UUID, conn *websocket.Conn) {
	room, ok := getRoom(userID)
	room.mu.Lock()
	defer room.mu.Unlock()

	if ok {
		for i, connection := range room.connections {
			if connection != nil && connection == conn {
				connection.Close()
				room.connections = append(room.connections[:i], room.connections[i+1:]...)
				break
			}
		}

		if len(room.connections) == 0 {
			room.startDisconnectTimer(5 * time.Minute)
		}
	}
}
