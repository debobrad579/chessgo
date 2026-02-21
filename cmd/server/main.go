package main

import (
	"database/sql"
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

	dbURL := os.Getenv("DB_URL")
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal("Failed to open database")
	}

	dbQueries := database.New(db)
	cfg := handlers.Config{DB: dbQueries}

	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			handlers.RenderTemplate(w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	mux.HandleFunc("/app/", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "app/index.html") })

	mux.HandleFunc("/login", handlers.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", cfg.LoginPostHandler)

	mux.HandleFunc("/register", handlers.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", cfg.RegisterPostHandler)

	log.Printf("Starting server at port %s\n", port)
	http.ListenAndServe(port, mux)
}
