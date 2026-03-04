package games

import (
	"errors"
	"time"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) MakeMove(move chess.Move, playerRole PlayerRole) error {
	if playerRole == Spectator {
		return errors.New("cannot make move as spectator")
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if !room.whiteExists() || !room.blackExists() {
		return errors.New("game not started")
	}

	if room.result != chess.ResultGameOngoing {
		return errors.New("game ended")
	}

	if (playerRole == White) != (room.game.Turn() == chess.White) {
		return errors.New("not your turn")
	}

	if !room.game.IsMoveValid(move) {
		return errors.New("invalid move")
	}

	if playerRole == White {
		room.whiteTime -= int(time.Since(room.turnStart).Milliseconds()) - room.game.TimeControl.Increment
		move.Timestamp = room.whiteTime
	} else {
		room.blackTime -= int(time.Since(room.turnStart).Milliseconds()) - room.game.TimeControl.Increment
		move.Timestamp = room.blackTime
	}

	room.game.Move(move)
	if room.pendingDrawOffer != playerRole {
		room.pendingDrawOffer = Spectator
	}
	room.result = room.game.Result().Result
	if room.result != chess.ResultGameOngoing {
		room.saveGame()
	} else {
		room.startTurnTimer()
	}

	select {
	case room.broadcast <- struct{}{}:
	default:
	}

	return nil
}
