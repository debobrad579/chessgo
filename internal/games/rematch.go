package games

import (
	"errors"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

func (room *GameRoom) RequestRematch(playerRole PlayerRole) error {
	room.mu.Lock()
	defer room.mu.Unlock()

	if room.result.Result == chess.ResultGameOngoing {
		return errors.New("game not over")
	}
	if playerRole == Spectator {
		return errors.New("spectators cannot request rematches")
	}

	switch room.rematchRequest {
	case Spectator:
		room.rematchRequest = playerRole
	case playerRole:
		room.rematchRequest = Spectator
	default:
		room.rematchGameID = room.createRematch()
	}

	room.notifyBroadcast()

	return nil
}

func (room *GameRoom) createRematch() uuid.UUID {
	game := chess.Game{
		State:       chess.NewGameState(),
		Moves:       []chess.Move{},
		White:       room.game.Black,
		Black:       room.game.White,
		TimeControl: room.game.TimeControl,
	}

	rematchRoom := GameRoom{
		id:               uuid.New(),
		game:             &game,
		broadcast:        make(chan struct{}),
		white:            playerInfo{time: game.TimeControl.Base, isGuest: room.black.isGuest},
		black:            playerInfo{time: game.TimeControl.Base, isGuest: room.white.isGuest},
		spectatorConns:   make(map[uuid.UUID]*websocket.Conn),
		db:               room.db,
		pendingDrawOffer: Spectator,
		rematchRequest:   Spectator,
		result:           chess.GameOver{Result: chess.ResultGameOngoing, Reason: chess.GameOngoing},
	}

	registry.mu.Lock()
	registry.rooms[rematchRoom.id] = &rematchRoom
	registry.mu.Unlock()

	registry.notifySubscribers()

	go rematchRoom.runBroadcastLoop()

	return rematchRoom.id
}
