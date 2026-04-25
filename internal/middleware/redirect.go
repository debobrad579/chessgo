package middleware

import "net/http"

func RedirectIfAuthenticated(path string) Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if _, ok := GetUserID(r.Context()); ok {
				http.Redirect(w, r, path, http.StatusTemporaryRedirect)
			} else {
				next.ServeHTTP(w, r)
			}
		})
	}
}
