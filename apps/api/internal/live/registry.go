package live

import (
	"sync"

	"github.com/google/uuid"
)

type gamesRegistry struct {
	mu          sync.Mutex
	rooms       map[uuid.UUID]*GameRoom
	subscribers map[chan struct{}]struct{}
}

func (reg *gamesRegistry) subscribe() chan struct{} {
	ch := make(chan struct{}, 1)
	reg.mu.Lock()
	reg.subscribers[ch] = struct{}{}
	reg.mu.Unlock()
	return ch
}

func (reg *gamesRegistry) unsubscribe(ch chan struct{}) {
	reg.mu.Lock()
	delete(reg.subscribers, ch)
	reg.mu.Unlock()
}

func (reg *gamesRegistry) notifySubscribers() {
	reg.mu.Lock()
	for ch := range reg.subscribers {
		select {
		case ch <- struct{}{}:
		default:
		}
	}
	reg.mu.Unlock()
}

var registry = gamesRegistry{
	rooms:       make(map[uuid.UUID]*GameRoom),
	subscribers: make(map[chan struct{}]struct{}),
}

func Subscribe() chan struct{} {
	return registry.subscribe()
}

func Unsubscribe(ch chan struct{}) {
	registry.unsubscribe(ch)
}
