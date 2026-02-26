package games

import "github.com/google/uuid"

func GetGamesList() map[uuid.UUID]*gameRoom {
	return registry.rooms
}
