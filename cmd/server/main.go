package main

import (
	"database/sql"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/handlers"
)

func main() {
	godotenv.Load()

	db, err := sql.Open("postgres", fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	))
	if err != nil {
		log.Fatal("Failed to open database")
	}

	cfg := handlers.Config{
		DB:          database.New(db),
		TokenSecret: os.Getenv("TOKEN_SECRET"),
		RNG:         rand.New(rand.NewSource(time.Now().UnixNano())),
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			handlers.RenderTemplate(w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	if os.Getenv("DEV") == "true" {
		viteURL, _ := url.Parse("http://localhost:5173")
		proxy := httputil.NewSingleHostReverseProxy(viteURL)

		mux.Handle("/@vite/", proxy)
		mux.Handle("/@react-refresh", proxy)
		mux.Handle("/node_modules/", proxy)
		mux.Handle("/app/", cfg.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r2 := r.Clone(r.Context())

			if path.Ext(r2.URL.Path) == "" {
				r2.URL.Path = "/app/"
			}

			proxy.ServeHTTP(w, r2)
		})))
	} else {
		mux.Handle("/app/",
			cfg.AuthMiddleware(
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

	port := ":" + os.Getenv("PORT")
	if port == ":" {
		port = ":3000"
	}

	log.Printf("Starting server at port %s\n", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal("Failed to start server")
	}
}
