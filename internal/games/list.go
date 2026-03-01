package games

import (
	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/chess"
)

type GameListItem struct {
	ID          uuid.UUID         `json:"id"`
	White       chess.Player      `json:"white"`
	Black       chess.Player      `json:"black"`
	TimeControl chess.TimeControl `json:"time_control"`
}

func GetGamesList() []GameListItem {
	items := make([]GameListItem, 0, len(registry.rooms))

	for id, room := range registry.rooms {
		items = append(items, GameListItem{
			ID:          id,
			White:       room.game.White,
			Black:       room.game.Black,
			TimeControl: room.game.TimeControl,
		})
	}

	return items
}
