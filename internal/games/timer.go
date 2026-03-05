package games

import (
	"time"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) startTurnTimer() {
	if room.turnTimer != nil {
		room.turnTimer.Stop()
	}

	var remaining int
	if room.game.Turn() == chess.White {
		remaining = room.white.time
	} else {
		remaining = room.black.time
	}

	room.turnStart = time.Now()
	room.turnTimer = time.AfterFunc(time.Duration(remaining)*time.Millisecond, func() {
		room.mu.Lock()
		if room.game.Turn() == chess.White {
			room.game.Result = chess.ResultBlackWon
		} else {
			room.game.Result = chess.ResultWhiteWon
		}
		room.saveGame()
		room.mu.Unlock()

		select {
		case room.broadcast <- struct{}{}:
		default:
		}
	})
}

func (room *GameRoom) getThinkTime() int {
	if !room.whiteExists() || !room.blackExists() {
		return 0
	}
	return int(time.Since(room.turnStart).Milliseconds())
}
