package handlers

import (
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/auth"
)

func (cfg *Config) AuthMiddleware(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jwtCookie, err := r.Cookie("jwt")
		if err == nil {
			if _, err = auth.ValidateJWT(jwtCookie.Value, cfg.TokenSecret); err == nil {
				handler.ServeHTTP(w, r)
				return
			}
		}

		refreshCookie, err := r.Cookie("refresh_token")
		if err != nil {
			handler.ServeHTTP(w, r)
			return
		}

		refreshToken, err := cfg.DB.GetRefreshToken(r.Context(), refreshCookie.Value)
		if err != nil || time.Now().After(refreshToken.ExpiresAt) || refreshToken.RevokedAt.Valid {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		if err := cfg.login(w, r, refreshToken.UserID); err != nil {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
