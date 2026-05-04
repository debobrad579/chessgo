package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/debobrad579/chessgo/internal/httperr"
)

func (cfg *Config) GetLoggedInUserHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
