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
		remaining = room.whiteTime
	} else {
		remaining = room.blackTime
	}

	room.turnStart = time.Now()
	room.turnTimer = time.AfterFunc(time.Duration(remaining)*time.Millisecond, func() {
		room.mu.Lock()
		if room.game.Turn() == chess.White {
			room.result = chess.ResultBlackWon
		} else {
			room.result = chess.ResultWhiteWon
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
