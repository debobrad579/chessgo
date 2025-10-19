package main

import (
	"net/http"

	"github.com/debobrad579/repertoire-go/handlers"
	"github.com/debobrad579/repertoire-go/utils"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
		} else {
			utils.RenderTemplate(w, "index.html", nil)
		}
	})

	mux.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("static"))))
	mux.HandleFunc("/app/", func(w http.ResponseWriter, r *http.Request) { http.ServeFile(w, r, "app/index.html") })
	mux.HandleFunc("/login", utils.TemplateRenderer("login.html", nil))
	mux.HandleFunc("POST /login", handlers.LoginPostHandler)
	mux.HandleFunc("/register", utils.TemplateRenderer("register.html", nil))
	mux.HandleFunc("POST /register", handlers.RegisterPostHandler)

	http.ListenAndServe(":3000", mux)
}
