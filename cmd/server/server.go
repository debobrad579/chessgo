package main

import (
	"fmt"
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/debobrad579/chessgo/internal/handlers"
	"github.com/debobrad579/chessgo/internal/middleware"
)

func startServer(cfg *handlers.Config, port int, appOrigin string) error {
	mux := http.NewServeMux()

	mux.Handle("GET /{$}", middleware.RedirectIfAuthenticated(appOrigin)(handlers.TemplateRenderer("index.html", nil)))
	mux.Handle("GET /login", middleware.RedirectIfAuthenticated(appOrigin)(handlers.TemplateRenderer("login.html", nil)))
	mux.Handle("GET /register", middleware.RedirectIfAuthenticated(appOrigin)(handlers.TemplateRenderer("register.html", nil)))

	mux.HandleFunc("POST /login", cfg.LoginPostHandler)
	mux.HandleFunc("POST /register", cfg.RegisterPostHandler)
	mux.HandleFunc("POST /logout", cfg.LogoutHandler)

	fileserver := http.FileServer(http.Dir("static"))
	mux.Handle("GET /static/", http.StripPrefix("/static/", fileserver))
	mux.Handle("GET /favicon.ico", fileserver)
	mux.Handle("GET /robots.txt", fileserver)

	mux.Handle("/api/", http.StripPrefix("/api", getApiMux(cfg)))

	mux.Handle("GET /metrics", promhttp.Handler())

	handler := middleware.Wrap(mux,
		middleware.CORS(appOrigin),
		middleware.Auth(cfg),
		middleware.RequestLogger(cfg.Logger),
	)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), handler)
}
