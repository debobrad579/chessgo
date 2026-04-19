package main

import (
	"net/http"
	"net/http/httputil"
	"net/url"
	"path"
)

func proxyVite(mux *http.ServeMux) {
	viteURL, _ := url.Parse("http://localhost:5173")
	proxy := httputil.NewSingleHostReverseProxy(viteURL)

	mux.Handle("GET /@vite/", proxy)
	mux.Handle("GET /@react-refresh", proxy)
	mux.Handle("GET /node_modules/", proxy)
	mux.Handle("GET /app/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r2 := r.Clone(r.Context())

		if path.Ext(r2.URL.Path) == "" {
			r2.URL.Path = "/app/"
		}

		proxy.ServeHTTP(w, r2)
	}))
}
