package main

import (
	"log"
	"net/http"

	"github.com/debobrad579/chessgo/handlers"
	"github.com/debobrad579/chessgo/utils"
)

const port = ":3000"

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			utils.RenderTemplate(w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	mux.HandleFunc("/app/", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "app/index.html") })
	mux.HandleFunc("/login", utils.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", handlers.LoginPostHandler)
	mux.HandleFunc("/register", utils.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", handlers.RegisterPostHandler)

	log.Printf("Starting server at port %s\n", port)
	http.ListenAndServe(port, mux)
}
