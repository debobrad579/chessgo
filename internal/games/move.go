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

	if room.game.Result != chess.ResultGameOngoing {
		return errors.New("game ended")
	}

	if (playerRole == White) != (room.game.Turn() == chess.White) {
		return errors.New("not your turn")
	}

	if !room.game.IsMoveValid(move) {
		return errors.New("invalid move")
	}

	if playerRole == White {
		room.white.time -= int(time.Since(room.turnStart).Milliseconds()) - room.game.TimeControl.Increment
		move.Timestamp = room.white.time
	} else {
		room.black.time -= int(time.Since(room.turnStart).Milliseconds()) - room.game.TimeControl.Increment
		move.Timestamp = room.black.time
	}

	room.game.Move(move)
	if room.pendingDrawOffer != playerRole {
		room.pendingDrawOffer = Spectator
	}
	room.game.Result = room.game.GetResult().Result
	if room.game.Result != chess.ResultGameOngoing {
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
