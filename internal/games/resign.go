package games

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) Resign(playerRole PlayerRole) error {
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.result.Result != chess.ResultGameOngoing {
		return errors.New("game already ended")
	}

	switch playerRole {
	case White:
		room.result = chess.GameOver{Result: chess.ResultBlackWon, Reason: chess.Resignation}
	case Black:
		room.result = chess.GameOver{Result: chess.ResultWhiteWon, Reason: chess.Resignation}
	default:
		return errors.New("invalid role")
	}

	room.saveGame()

	room.notifyBroadcast()

	return nil
}
