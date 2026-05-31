package bot

import (
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/debobrad579/chessgo/internal/chess"
)

func createGame(userID uuid.UUID, color chess.Color) *gameRoom {
	var game *chess.Game

	if color == chess.White {
		game = &chess.Game{
			State:       chess.NewGameState(),
			Moves:       []chess.Move{},
			TimeControl: chess.TimeControl{Base: 3 * 60 * 1000, Increment: 2 * 1000},
			White: chess.Player{
				ID:   userID,
				Name: "Anonymous",
			},
			Black: chess.Player{
				Name: "OxChess",
			},
		}
	} else {
		game = &chess.Game{
			State:       chess.NewGameState(),
			Moves:       []chess.Move{},
			TimeControl: chess.TimeControl{Base: 3 * 60 * 1000, Increment: 2 * 1000},
			White: chess.Player{
				Name: "OxChess",
			},
			Black: chess.Player{
				ID:   userID,
				Name: "Anonymous",
			},
		}
	}

	room := &gameRoom{
		userID: userID,
		game:   game,
		result: chess.GameOver{Result: chess.ResultGameOngoing, Reason: chess.GameOngoing},
	}

	registry.mu.Lock()
	registry.rooms[userID] = room
	registry.mu.Unlock()

	if color == chess.Black {
		engineMove, err := room.getEngineMove(&room.game.State)
		if err == nil {
			room.game.Move(*engineMove)
		}
	}

	return room
}

func NewGame(userID uuid.UUID, color chess.Color, conn *websocket.Conn) {
	connections := []*websocket.Conn{}
	if room, ok := getRoom(userID); ok {
		connections = room.connections
	}

	room := createGame(userID, color)
	room.connections = connections
	room.sendGameData()
}
