package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/RchrdHndrcks/gochess/chess"
	"github.com/gorilla/websocket"
)

type Game struct {
	Moves     []Move `json:"moves"`
	Result    string `json:"result"`
	White     Player `json:"white"`
	Black     Player `json:"black"`
	ThinkTime int    `json:"think_time,omitempty"`
}

type Player struct {
	Name string `json:"name"`
	Elo  string `json:"elo"`
}

type Move struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Timestamp int    `json:"timestamp"`
	Promotion string `json:"promotion,omitempty"`
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Game, 256)

var (
	mu        sync.Mutex
	chessGame *chess.Chess
	game      Game
)

func init() {
	var err error
	chessGame, err = chess.New()
	if err != nil {
		panic(err)
	}
	game = Game{
		Moves:  []Move{},
		Result: "*",
		White:  Player{Name: "Brady DeBoer", Elo: "1733"},
		Black:  Player{Name: "Lee Hendon", Elo: "1735"},
	}
}

func WebsocketsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Error upgrading:", err)
		return
	}

	clients[conn] = true
	defer func() {
		conn.Close()
		delete(clients, conn)
	}()

	data, err := json.Marshal(game)
	if err != nil {
		fmt.Println("Error encoding initial game:", err)
		return
	}
	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		fmt.Println("Error sending initial game state:", err)
		return
	}

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}

		var move Move
		if err = json.Unmarshal(message, &move); err != nil {
			fmt.Println("Error parsing json:", err)
			break
		}

		if err = chessGame.MakeMove(move.From + move.To); err != nil {
			fmt.Println("Illegal move:", move.From+move.To)
			break
		}

		game.Moves = append(game.Moves, move)

		broadcast <- game
	}
}

func HandleBroadcasts() {
	for {
		game := <-broadcast

		data, err := json.Marshal(game)
		if err != nil {
			fmt.Println("Error encoding json:", err)
			continue
		}

		for conn := range clients {
			err := conn.WriteMessage(websocket.TextMessage, data)
			if err != nil {
				fmt.Println("Error writing to client:", err)
				conn.Close()
				delete(clients, conn)
			}
		}
	}
}
