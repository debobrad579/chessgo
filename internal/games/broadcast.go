package games

import (
	"encoding/json"

	"github.com/gorilla/websocket"
)

func (r *gameRoom) runBroadcastLoop() {
	for range r.broadcast {
		r.mu.Lock()

		data, err := json.Marshal(GameReturnType{Game: r.game, ThinkTime: r.thinkTime})
		if err != nil {
			r.mu.Unlock()
			continue
		}

		white := r.whiteConn
		black := r.blackConn

		r.mu.Unlock()

		if white != nil {
			if err := white.WriteMessage(websocket.TextMessage, data); err != nil {
				white.Close()
				r.mu.Lock()
				if r.whiteConn == white {
					r.whiteConn = nil
				}
				r.mu.Unlock()
			}
		}

		if black != nil {
			if err := black.WriteMessage(websocket.TextMessage, data); err != nil {
				black.Close()
				r.mu.Lock()
				if r.blackConn == black {
					r.blackConn = nil
				}
				r.mu.Unlock()
			}
		}
	}
}
