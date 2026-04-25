package middleware

import "net/http"

func CORS(allowedOrigins ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Set("Access-Control-Allow-Credentials", "true")
					w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
					w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
					if r.Method == http.MethodOptions {
						w.WriteHeader(http.StatusNoContent)
						return
					}

					break
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}
