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

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			handlers.RenderTemplate(r.Context(), w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	if dev {
		viteURL, _ := url.Parse("http://localhost:5173")
		proxy := httputil.NewSingleHostReverseProxy(viteURL)

		mux.Handle("/@vite/", proxy)
		mux.Handle("/@react-refresh", proxy)
		mux.Handle("/node_modules/", proxy)
		mux.Handle("/app/", middleware.Auth(cfg)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r2 := r.Clone(r.Context())

			if path.Ext(r2.URL.Path) == "" {
				r2.URL.Path = "/app/"
			}

			proxy.ServeHTTP(w, r2)
		})))
	} else {
		mux.Handle("/app/",
			middleware.Auth(cfg)(
				http.HandlerFunc(handlers.TemplateRenderer("app.html", nil)),
			),
		)
	}

	mux.HandleFunc("/login", handlers.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", cfg.LoginPostHandler)

	mux.HandleFunc("/register", handlers.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", cfg.RegisterPostHandler)

	mux.HandleFunc("POST /logout", cfg.LogoutHandler)

	mux.HandleFunc("/api/me", cfg.ApiMeHandler)

	mux.HandleFunc("POST /api/live/new", cfg.NewGameHandler)
	mux.HandleFunc("/api/live/{gameID}", cfg.ConnectToGameHandler)
	mux.HandleFunc("/api/live", cfg.GamesListHandler)

	mux.HandleFunc("/api/games", cfg.MyGamesHandler)
	mux.HandleFunc("/api/games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("/api/games/{gameID}", cfg.GameHandler)

	return http.ListenAndServe(fmt.Sprintf(":%d", port), middleware.RequestLogger(cfg.Logger)(mux))
}
