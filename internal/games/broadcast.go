package games

import (
	"encoding/json"

	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type GameData struct {
	Moves            []chess.Move      `json:"moves"`
	TimeControl      chess.TimeControl `json:"time_control"`
	ThinkTime        int               `json:"think_time"`
	Result           chess.Result      `json:"result"`
	White            chess.Player      `json:"white"`
	Black            chess.Player      `json:"black"`
	PendingDrawOffer PlayerRole        `json:"pending_draw_offer"`
}

func (room *GameRoom) getGameData() ([]byte, error) {
	return json.Marshal(GameData{
		Moves:            room.game.Moves,
		TimeControl:      room.game.TimeControl,
		ThinkTime:        room.getThinkTime(),
		Result:           room.game.Result,
		White:            room.game.White,
		Black:            room.game.Black,
		PendingDrawOffer: room.pendingDrawOffer,
	})
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
