package games

import (
	"context"
	"encoding/json"

	"github.com/debobrad579/chessgo/internal/database"
)

func (room *GameRoom) saveGame() (*database.Game, error) {
	movesJSON, err := json.Marshal(room.game.Moves)
	if err != nil {
		return nil, err
	}

	game, err := room.db.CreateGame(context.Background(), database.CreateGameParams{
		ID:                   room.id,
		WhiteID:              room.game.White.ID,
		BlackID:              room.game.Black.ID,
		TimeControlBase:      int32(room.game.TimeControl.Base),
		TimeControlIncrement: int32(room.game.TimeControl.Increment),
		Result:               string(room.result),
		Moves:                json.RawMessage(movesJSON),
	})

	return &game, err
}
