package bot

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type LiveGame struct {
	ID           uuid.UUID         `json:"id"`
	Moves        []chess.Move      `json:"moves"`
	White        chess.Player      `json:"white"`
	Black        chess.Player      `json:"black"`
	TimeControl  chess.TimeControl `json:"time_control"`
	ThinkTime    int               `json:"think_time"`
	Result       chess.Result      `json:"result"`
	ResultReason chess.Reason      `json:"result_reason"`
}

func (room *gameRoom) sendGameData() error {
	data, err := json.Marshal(LiveGame{
		ID:           room.userID,
		Moves:        room.game.Moves,
		TimeControl:  room.game.TimeControl,
		ThinkTime:    0,
		Result:       room.result.Result,
		ResultReason: room.result.Reason,
		White:        room.game.White,
		Black:        room.game.Black,
	})
	if err != nil {
		return err
	}

	for _, conn := range room.connections {
		if conn != nil {
			conn.WriteMessage(websocket.TextMessage, data)
		}
	}

	return nil
}
