package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/games"
)

func (cfg *Config) NewGameHandler(w http.ResponseWriter, r *http.Request) {
	data, err := games.New()
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

	games.ConnectToGame(w, r, gameID, user)
}

func (cfg *Config) GamesListHandler(w http.ResponseWriter, r *http.Request) {
	gameRooms := games.GetGamesList()

	data, err := json.Marshal(gameRooms)
	if err != nil {
		http.Error(w, "failed to marshal data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
