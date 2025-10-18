package main

import "net/http"

func main() {
	mux := http.NewServeMux()

	mux.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("static"))))

	mux.HandleFunc("/app/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "app/index.html")
	})

	mux.Handle("/", http.FileServer(http.Dir("views")))

	http.ListenAndServe(":3000", mux)
}
