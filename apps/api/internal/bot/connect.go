package bot

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Connect(w http.ResponseWriter, r *http.Request, userID uuid.UUID) (*websocket.Conn, *GameRoom) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "failed to upgrade websocket", http.StatusBadRequest)
		return nil, nil
	}

	room, ok := registry.rooms[userID]
	if !ok {
		game := chess.Game{
			State:       chess.NewGameState(),
			Moves:       []chess.Move{},
			TimeControl: chess.TimeControl{Base: 3 * 60 * 1000, Increment: 2 * 1000},
			White: chess.Player{
				ID:   userID,
				Name: "Anonymous",
			},
		}

		room = &GameRoom{
			UserID:      userID,
			playerColor: chess.White,
			game:        &game,
			result:      chess.GameOver{Result: chess.ResultGameOngoing, Reason: chess.GameOngoing},
		}

		registry.rooms[userID] = room
	}

	room.userConn = conn

	room.sendGameData()

	return conn, room
}

func Disconnect(userID uuid.UUID) {
	room := registry.rooms[userID]
	if room.userConn != nil {
		room.userConn.Close()
		room.userConn = nil
	}
}
