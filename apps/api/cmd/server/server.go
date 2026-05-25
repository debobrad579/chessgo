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

	mux.HandleFunc("GET /me", cfg.GetLoggedInUserHandler)
	mux.HandleFunc("POST /users", cfg.CreateUserHandler)

	mux.HandleFunc("POST /tokens", cfg.LoginHandler)
	mux.HandleFunc("DELETE /tokens", cfg.LogoutHandler)

	mux.HandleFunc("GET /games", cfg.GetGamesHandler)
	mux.HandleFunc("GET /games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("GET /games/{gameID}", cfg.GetGameHandler)

	mux.HandleFunc("GET /live", cfg.GetLiveGamesHandler)
	mux.HandleFunc("GET /live/{gameID}", cfg.ConnectToLiveGameHandler)
	mux.HandleFunc("POST /live", cfg.CreateLiveGameHandler)

	mux.HandleFunc("GET /bot", cfg.ConnectToBotHandler)

	mux.Handle("GET /metrics", promhttp.Handler())

	handler := middleware.Wrap(mux,
		middleware.CORS(appOrigin, wwwOrigin),
		middleware.Auth(cfg),
		middleware.RequestLogger(cfg.Logger),
	)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
}
