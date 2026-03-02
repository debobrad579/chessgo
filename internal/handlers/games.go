package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

func (cfg *Config) MyGamesHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUser(r)
	if err != nil || user == nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	games, err := cfg.DB.GetGamesByUser(r.Context(), database.GetGamesByUserParams{WhiteID: user.ID, Limit: 10, Column3: 1})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(games)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) GameHandler(w http.ResponseWriter, r *http.Request) {
	gameIDStr := r.PathValue("gameID")

	gameID, err := uuid.Parse(gameIDStr)
	if err != nil {
		http.Error(w, "invalid game ID", http.StatusBadRequest)
		return
	}

	game, err := cfg.DB.GetGame(r.Context(), gameID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "game not found", http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	data, err := json.Marshal(game)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
