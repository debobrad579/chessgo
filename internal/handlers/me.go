package handlers

import (
	"encoding/json"
	"net/http"
)

func (cfg *Config) ApiMeHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}
