package bot

import "time"

func (room *gameRoom) startDisconnectTimer(duration time.Duration) {
	if room.disconnectTimer != nil {
		room.disconnectTimer.Stop()
	}

	room.disconnectTimer = time.AfterFunc(duration, func() {
		registry.mu.Lock()
		delete(registry.rooms, room.userID)
		registry.mu.Unlock()
	})
}

func (room *gameRoom) stopDisconnectTimer() {
	if room.disconnectTimer != nil {
		room.disconnectTimer.Stop()
		room.disconnectTimer = nil
	}
}
