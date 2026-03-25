package live

import (
	"encoding/json"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type LiveGame struct {
	Moves            []chess.Move      `json:"moves"`
	White            chess.Player      `json:"white"`
	Black            chess.Player      `json:"black"`
	TimeControl      chess.TimeControl `json:"time_control"`
	ThinkTime        int               `json:"think_time"`
	Result           chess.Result      `json:"result"`
	ResultReason     chess.Reason      `json:"result_reason"`
	PendingDrawOffer PlayerRole        `json:"pending_draw_offer"`
	RematchRequest   PlayerRole        `json:"rematch_request"`
	RematchGameID    uuid.UUID         `json:"rematch_game_id"`
	WhiteConnected   bool              `json:"white_connected"`
	BlackConnected   bool              `json:"black_connected"`
}

func (room *GameRoom) getGameData() ([]byte, error) {
	return json.Marshal(LiveGame{
		Moves:            room.game.Moves,
		TimeControl:      room.game.TimeControl,
		ThinkTime:        room.getThinkTime(),
		Result:           room.result.Result,
		ResultReason:     room.result.Reason,
		White:            room.game.White,
		Black:            room.game.Black,
		PendingDrawOffer: room.pendingDrawOffer,
		RematchRequest:   room.rematchRequest,
		RematchGameID:    room.rematchGameID,
		WhiteConnected:   room.white.conn != nil,
		BlackConnected:   room.black.conn != nil,
	})
}

func (room *GameRoom) notifyBroadcast() {
	select {
	case room.broadcast <- struct{}{}:
	default:
	}
}

func (room *GameRoom) runBroadcastLoop() {
	for range room.broadcast {
		room.mu.Lock()

		data, err := room.getGameData()
		if err != nil {
			room.mu.Unlock()
			continue
		}

		room.mu.Unlock()

		if room.white.conn != nil {
			if err := room.white.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				room.white.conn.Close()
				room.mu.Lock()
				room.white.conn = nil
				room.mu.Unlock()
			}
		}

		if room.black.conn != nil {
			if err := room.black.conn.WriteMessage(websocket.TextMessage, data); err != nil {
				room.black.conn.Close()
				room.mu.Lock()
				room.black.conn = nil
				room.mu.Unlock()
			}
		}

		for _, conn := range room.spectatorConns {
			if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
				conn.Close()
			}
		}
	}
}
