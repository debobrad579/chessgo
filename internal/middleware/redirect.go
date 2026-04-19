package middleware

import "net/http"

func RedirectIfAuthenticated(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, ok := GetUser(r.Context()); ok {
			http.Redirect(w, r, "/app", http.StatusTemporaryRedirect)
		} else {
			next.ServeHTTP(w, r)
		}
	})
}
