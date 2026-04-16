package main

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"path"

	"github.com/debobrad579/chessgo/internal/handlers"
	"github.com/debobrad579/chessgo/internal/middleware"
)

func startServer(cfg *handlers.Config, port int, dev bool) error {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			handlers.RenderTemplate(r.Context(), w, "index.html", nil)
		}
	})

	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	if dev {
		viteURL, _ := url.Parse("http://localhost:5173")
		proxy := httputil.NewSingleHostReverseProxy(viteURL)

		mux.Handle("GET /@vite/", proxy)
		mux.Handle("GET /@react-refresh", proxy)
		mux.Handle("GET /node_modules/", proxy)
		mux.Handle("GET /app/", middleware.Auth(cfg)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r2 := r.Clone(r.Context())

			if path.Ext(r2.URL.Path) == "" {
				r2.URL.Path = "/app/"
			}

			proxy.ServeHTTP(w, r2)
		})))
	} else {
		mux.Handle("GET /app/",
			middleware.Auth(cfg)(
				http.HandlerFunc(handlers.TemplateRenderer("app.html", nil)),
			),
		)
	}

	mux.HandleFunc("GET /login", handlers.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", cfg.LoginPostHandler)

	mux.HandleFunc("GET /register", handlers.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", cfg.RegisterPostHandler)

	mux.HandleFunc("POST /logout", cfg.LogoutHandler)

	mux.HandleFunc("GET /api/me", cfg.ApiMeHandler)

	mux.HandleFunc("POST /api/live/new", cfg.NewGameHandler)
	mux.HandleFunc("GET /api/live/{gameID}", cfg.ConnectToGameHandler)
	mux.HandleFunc("GET /api/live", cfg.GamesListHandler)

	mux.HandleFunc("GET /api/games", cfg.MyGamesHandler)
	mux.HandleFunc("GET /api/games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("GET /api/games/{gameID}", cfg.GameHandler)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), middleware.RequestLogger(cfg.Logger)(mux))
}
