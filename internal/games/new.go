package games

import (
	"encoding/json"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/google/uuid"
)

func New() ([]byte, error) {
	type returnVals struct {
		GameID uuid.UUID `json:"game_id"`
	}

	game := chess.Game{
		State:  chess.NewGameState(),
		Moves:  []chess.Move{},
		Result: "*",
		TimeControl: chess.TimeControl{
			Base:      3 * 60 * 1000,
			Increment: 2 * 1000,
		},
	}

	room := gameRoom{
		game:      &game,
		broadcast: make(chan struct{}),
		whiteTime: game.TimeControl.Base,
		blackTime: game.TimeControl.Base,
	}

	gameID := uuid.New()

	data, err := json.Marshal(returnVals{gameID})
	if err != nil {
		return nil, err
	}

	registry.mu.Lock()
	registry.rooms[gameID] = &room
	registry.mu.Unlock()

	go room.runBroadcastLoop()

	return data, nil
}
