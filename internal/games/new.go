package games

import (
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
)

func New(user *database.User, db *database.Queries, color chess.Color, timeControl chess.TimeControl) ([]byte, error) {
	if user == nil {
		return nil, errors.New("must be logged in")
	}

	type returnVals struct {
		GameID uuid.UUID `json:"game_id"`
	}

	game := chess.Game{
		State:       chess.NewGameState(),
		Moves:       []chess.Move{},
		TimeControl: timeControl,
	}

	player := chess.Player{ID: user.ID, Name: user.Name}

	if color == chess.White {
		game.White = player
	} else {
		game.Black = player
	}

	room := GameRoom{
		id:               uuid.New(),
		game:             &game,
		broadcast:        make(chan struct{}),
		white:            playerInfo{time: game.TimeControl.Base},
		black:            playerInfo{time: game.TimeControl.Base},
		spectatorConns:   make(map[uuid.UUID]*websocket.Conn),
		db:               db,
		pendingDrawOffer: Spectator,
		result:           chess.GameOver{Result: chess.ResultGameOngoing, Reason: chess.GameOngoing},
	}

	if color == chess.White {
		room.white.isGuest = user.Email == ""
	} else {
		room.black.isGuest = user.Email == ""
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
