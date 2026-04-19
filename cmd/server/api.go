package main

import (
	"net/http"

	"github.com/debobrad579/chessgo/internal/handlers"
)

func getApiMux(cfg *handlers.Config) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /me", cfg.ApiMeHandler)
	mux.HandleFunc("POST /live/new", cfg.NewGameHandler)
	mux.HandleFunc("GET /live/{gameID}", cfg.ConnectToGameHandler)
	mux.HandleFunc("GET /live", cfg.GamesListHandler)
	mux.HandleFunc("GET /games", cfg.MyGamesHandler)
	mux.HandleFunc("GET /games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("GET /games/{gameID}", cfg.GameHandler)

	return mux
}
