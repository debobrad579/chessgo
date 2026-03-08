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
		defer room.mu.Unlock()

		if room.result.Result != chess.ResultGameOngoing {
			return
		}

		if room.game.Turn() == chess.White {
			room.result = chess.GameOver{Result: chess.ResultBlackWon, Reason: chess.Timeout}
		} else {
			room.result = chess.GameOver{Result: chess.ResultWhiteWon, Reason: chess.Timeout}
		}

		room.saveGame()
		room.notifyBroadcast()
	})
}

func (room *GameRoom) startDisconnectTimer() {
	if room.disconnectTimer != nil {
		room.disconnectTimer.Stop()
	}

	room.disconnectTimer = time.AfterFunc(time.Duration(5*time.Minute), func() {
		room.mu.Lock()
		if room.white.conn != nil || room.black.conn != nil {
			room.mu.Unlock()
			return
		}

		if room.turnTimer != nil {
			room.turnTimer.Stop()
		}
		if room.broadcast != nil {
			close(room.broadcast)
		}

		room.mu.Unlock()

		registry.mu.Lock()
		delete(registry.rooms, room.id)
		registry.mu.Unlock()
		registry.notifySubscribers()
	})
}

func (room *GameRoom) stopDisconnectTimer() {
	if room.disconnectTimer != nil {
		room.disconnectTimer.Stop()
		room.disconnectTimer = nil
	}
}

func (room *GameRoom) getThinkTime() int {
	if !room.whiteExists() || !room.blackExists() {
		return 0
	}
	return int(time.Since(room.turnStart).Milliseconds())
}
