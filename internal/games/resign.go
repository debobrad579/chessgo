package games

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) Resign(playerRole PlayerRole) error {
	if room.result != chess.ResultGameOngoing {
		return errors.New("game already ended")
	}

	switch playerRole {
	case White:
		room.result = chess.ResultBlackWon
	case Black:
		room.result = chess.ResultBlackWon
	default:
		return errors.New("invalid role")
	}

	room.saveGame()

	select {
	case room.broadcast <- struct{}{}:
	default:
	}

	return nil
}
