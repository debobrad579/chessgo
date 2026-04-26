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

	mux.HandleFunc("POST /login", cfg.LoginHandler)
	mux.HandleFunc("POST /register", cfg.RegisterHandler)
	mux.HandleFunc("POST /logout", cfg.LogoutHandler)

	fileserver := http.FileServer(http.Dir("static"))
	mux.Handle("GET /static/", http.StripPrefix("/static/", fileserver))
	mux.Handle("GET /favicon.ico", fileserver)
	mux.Handle("GET /robots.txt", fileserver)

	mux.Handle("/api/", http.StripPrefix("/api", getApiMux(cfg)))

	mux.Handle("GET /metrics", promhttp.Handler())

	handler := middleware.Wrap(mux,
		middleware.CORS(appOrigin, wwwOrigin),
		middleware.Auth(cfg),
		middleware.RequestLogger(cfg.Logger),
	)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
}
