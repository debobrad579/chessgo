package games

import (
	"context"
	"encoding/json"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

func (room *GameRoom) saveGame() (*database.Game, error) {
	if room.white.isGuest && room.black.isGuest {
		return nil, nil
	}

	movesJSON, err := json.Marshal(room.game.Moves)
	if err != nil {
		return nil, err
	}

	game, err := room.db.CreateGame(context.Background(), database.CreateGameParams{
		ID:                   room.id,
		WhiteID:              uuid.NullUUID{UUID: room.game.White.ID, Valid: !room.white.isGuest},
		BlackID:              uuid.NullUUID{UUID: room.game.Black.ID, Valid: !room.black.isGuest},
		TimeControlBase:      int32(room.game.TimeControl.Base),
		TimeControlIncrement: int32(room.game.TimeControl.Increment),
		Result:               string(room.game.Result),
		Moves:                json.RawMessage(movesJSON),
	})

	return &game, err
}
