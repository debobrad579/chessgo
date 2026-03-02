package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/games"
)

type newGameOptions struct {
	Color       string `json:"color"`
	TimeControl string `json:"time_control"`
}

func (cfg *Config) NewGameHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUser(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer r.Body.Close()

	var gameOptions newGameOptions

	if err = json.NewDecoder(r.Body).Decode(&gameOptions); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	playerColor := chess.White
	if gameOptions.Color == "black" {
		playerColor = chess.Black
	}

	baseStr, incrementStr, found := strings.Cut(gameOptions.TimeControl, "+")
	if !found {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	base, err := strconv.Atoi(baseStr)
	if err != nil {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	increment, err := strconv.Atoi(incrementStr)
	if err != nil {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	data, err := games.New(user, cfg.DB, playerColor, chess.TimeControl{Base: base * 60 * 1000, Increment: increment * 1000})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) ConnectToGameHandler(w http.ResponseWriter, r *http.Request) {
	gameIDStr := r.PathValue("gameID")

	gameID, err := uuid.Parse(gameIDStr)
	if err != nil {
		http.Error(w, "invalid game ID", http.StatusBadRequest)
		return
	}

	user, err := cfg.getUser(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	room, err := games.GetGameRoom(gameID)
	if err != nil {
		http.Error(w, "game room not found", http.StatusNotFound)
		return
	}

	conn, playerRole := room.Connect(w, r, user)
	if conn == nil {
		return
	}
	defer room.Disconnect(user)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("failed to read message: ", err)
			return
		}

		room.MakeMove(message, playerRole)
	}
}

func (cfg *Config) GamesListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	ch := games.Subscribe()
	defer games.Unsubscribe(ch)

	sendSnapshot(w, flusher)

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ch:
			sendSnapshot(w, flusher)
		}
	}
}

func sendSnapshot(w http.ResponseWriter, flusher http.Flusher) {
	data, err := json.Marshal(games.GetGamesList())
	if err != nil {
		return
	}
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}
