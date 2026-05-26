package bot

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/google/uuid"
)

func Resign(userID uuid.UUID) error {
	room, ok := getRoom(userID)
	if !ok {
		return errors.New("room does not exist")
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	if room.result.Result != chess.ResultGameOngoing {
		return errors.New("game already ended")
	}

	switch room.getUserColor(userID) {
	case chess.White:
		room.result = chess.GameOver{Result: chess.ResultBlackWon, Reason: chess.Resignation}
	case chess.Black:
		room.result = chess.GameOver{Result: chess.ResultWhiteWon, Reason: chess.Resignation}
	default:
		return errors.New("invalid color")
	}

	return room.sendGameData()
}
