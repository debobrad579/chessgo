package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/debobrad579/chessgo/internal/handlers"
	"github.com/debobrad579/chessgo/internal/middleware"
)

func startServer(cfg *handlers.Config, port int, appOrigin, wwwOrigin string) error {
	mux := http.NewServeMux()

	mux.Handle("GET /metrics", promhttp.Handler())

	mux.HandleFunc("POST /login", cfg.LoginHandler)
	mux.HandleFunc("POST /register", cfg.RegisterHandler)
	mux.HandleFunc("POST /logout", cfg.LogoutHandler)

	mux.HandleFunc("GET /me", cfg.ApiMeHandler)
	mux.HandleFunc("POST /live/new", cfg.NewGameHandler)
	mux.HandleFunc("GET /live/{gameID}", cfg.ConnectToGameHandler)
	mux.HandleFunc("GET /live", cfg.GamesListHandler)
	mux.HandleFunc("GET /games", cfg.MyGamesHandler)
	mux.HandleFunc("GET /games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("GET /games/{gameID}", cfg.GameHandler)

	handler := middleware.Wrap(mux,
		middleware.CORS(appOrigin, wwwOrigin),
		middleware.Auth(cfg),
		middleware.RequestLogger(cfg.Logger),
	)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
}
