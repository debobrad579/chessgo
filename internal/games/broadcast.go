package games

import (
	"encoding/json"

	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

type GameData struct {
	Moves       []chess.Move      `json:"moves"`
	TimeControl chess.TimeControl `json:"time_control"`
	ThinkTime   int               `json:"think_time"`
	Result      chess.Result      `json:"result"`
	White       chess.Player      `json:"white"`
	Black       chess.Player      `json:"black"`
}

func (room *GameRoom) getGameData() ([]byte, error) {
	return json.Marshal(GameData{
		Moves:       room.game.Moves,
		TimeControl: room.game.TimeControl,
		ThinkTime:   room.getThinkTime(),
		Result:      room.result,
		White:       room.game.White,
		Black:       room.game.Black,
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

		if room.whiteConn != nil {
			if err := room.whiteConn.WriteMessage(websocket.TextMessage, data); err != nil {
				room.whiteConn.Close()
				room.mu.Lock()
				room.whiteConn = nil
				room.mu.Unlock()
			}
		}

		if room.blackConn != nil {
			if err := room.blackConn.WriteMessage(websocket.TextMessage, data); err != nil {
				room.blackConn.Close()
				room.mu.Lock()
				room.blackConn = nil
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
