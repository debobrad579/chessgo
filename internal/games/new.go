package games

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
)

func New(user *database.User, color chess.Color, timeControl chess.TimeControl) ([]byte, error) {
	type returnVals struct {
		GameID uuid.UUID `json:"game_id"`
	}

	game := chess.Game{
		State:       chess.NewGameState(),
		Moves:       []chess.Move{},
		Result:      "*",
		TimeControl: timeControl,
	}

	player := chess.Player{ID: user.ID, Name: user.Name}

	if color == chess.White {
		game.White = player
	} else {
		game.Black = player
	}

	room := GameRoom{
		id:             uuid.New(),
		game:           &game,
		broadcast:      make(chan struct{}),
		whiteTime:      game.TimeControl.Base,
		blackTime:      game.TimeControl.Base,
		spectatorConns: make(map[uuid.UUID]*websocket.Conn),
	}

	data, err := json.Marshal(returnVals{room.id})
	if err != nil {
		return nil, err
	}

	registry.mu.Lock()
	registry.rooms[room.id] = &room
	registry.mu.Unlock()

	registry.notifySubscribers()

	go room.runBroadcastLoop()

	return data, nil
}
