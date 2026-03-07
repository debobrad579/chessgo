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
			room.result = chess.GameOver{Result: chess.ResultBlackWon, Reason: chess.Timeout}
		} else {
			room.result = chess.GameOver{Result: chess.ResultWhiteWon, Reason: chess.Timeout}
		}
		room.saveGame()
		room.mu.Unlock()

		room.notifyBroadcast()
	})
}

func (room *GameRoom) getThinkTime() int {
	if !room.whiteExists() || !room.blackExists() {
		return 0
	}
	return int(time.Since(room.turnStart).Milliseconds())
}
