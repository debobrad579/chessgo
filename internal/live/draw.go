package live

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) OfferDraw(playerRole PlayerRole) error {
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.result.Result != chess.ResultGameOngoing {
		return errors.New("game already ended")
	}
	if playerRole == Spectator {
		return errors.New("spectators cannot offer draws")
	}
	if room.pendingDrawOffer != Spectator {
		return errors.New("draw already pending")
	}

	room.pendingDrawOffer = playerRole

	room.notifyBroadcast()

	return nil
}

func (room *GameRoom) RespondToDraw(playerRole PlayerRole, accept bool) error {
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.pendingDrawOffer == Spectator {
		return errors.New("no pending draw offer")
	}
	if room.pendingDrawOffer == playerRole {
		return errors.New("cannot respond to your own draw offer")
	}

	if !accept {
		room.pendingDrawOffer = Spectator
		room.notifyBroadcast()
		return nil
	}

	room.result = chess.GameOver{
		Result: chess.ResultDraw,
		Reason: chess.Agreement,
	}
	room.pendingDrawOffer = Spectator
	room.saveGame()

	room.notifyBroadcast()

	return nil
}
