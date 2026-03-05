package games

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
)

func (room *GameRoom) OfferDraw(playerRole PlayerRole) error {
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.game.Result != chess.ResultGameOngoing {
		return errors.New("game already ended")
	}
	if playerRole == Spectator {
		return errors.New("spectators cannot offer draws")
	}
	if room.pendingDrawOffer != Spectator {
		return errors.New("draw already pending")
	}

	room.pendingDrawOffer = playerRole

	select {
	case room.broadcast <- struct{}{}:
	default:
	}

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
		select {
		case room.broadcast <- struct{}{}:
		default:
		}
		return nil
	}

	room.game.Result = chess.ResultDraw
	room.pendingDrawOffer = Spectator
	room.saveGame()

	select {
	case room.broadcast <- struct{}{}:
	default:
	}

	return nil
}
