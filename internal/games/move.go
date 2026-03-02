package games

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) MakeMove(message []byte, playerRole PlayerRole) error {
	if playerRole == Spectator {
		return errors.New("cannot make move as spectator")
	}

	var move chess.Move
	if err := json.Unmarshal(message, &move); err != nil {
		return err
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
	room.result = room.game.Result().Result
	room.startTurnTimer()

	select {
	case room.broadcast <- struct{}{}:
	default:
	}

	return nil
}
