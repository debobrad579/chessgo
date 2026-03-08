package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/handlers"
)

const port = ":3000"

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

	dbQueries := database.New(db)
	cfg := handlers.Config{DB: dbQueries, TokenSecret: os.Getenv("TOKEN_SECRET")}

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			handlers.RenderTemplate(w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))

	mux.Handle("/app/", cfg.AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "app/index.html")
	})))

	mux.HandleFunc("/login", handlers.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", cfg.LoginPostHandler)

	mux.HandleFunc("/register", handlers.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", cfg.RegisterPostHandler)

	mux.HandleFunc("/api/me", cfg.ApiMeHandler)

	mux.HandleFunc("POST /api/live/new", cfg.NewGameHandler)
	mux.HandleFunc("/api/live/{gameID}", cfg.ConnectToGameHandler)
	mux.HandleFunc("/api/live", cfg.GamesListHandler)

	mux.HandleFunc("/api/games", cfg.MyGamesHandler)
	mux.HandleFunc("/api/games/count", cfg.GetGamesCountHandler)
	mux.HandleFunc("/api/games/{gameID}", cfg.GameHandler)

	log.Printf("Starting server at port %s\n", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal("Failed to start server")
	}
}
