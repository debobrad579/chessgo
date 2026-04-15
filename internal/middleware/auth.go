package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

type authenticator interface {
	ValidateJWT(token string) (uuid.UUID, error)
	GetRefreshToken(ctx context.Context, token string) (database.RefreshToken, error)
	Login(w http.ResponseWriter, r *http.Request, userID uuid.UUID) error
}

func Auth(a authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			jwtCookie, err := r.Cookie("jwt")
			if err == nil {
				if _, err = a.ValidateJWT(jwtCookie.Value); err == nil {
					next.ServeHTTP(w, r)
					return
				}
			}

			refreshCookie, err := r.Cookie("refresh_token")
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}

			refreshToken, err := a.GetRefreshToken(r.Context(), refreshCookie.Value)
			if err != nil || time.Now().After(refreshToken.ExpiresAt) || refreshToken.RevokedAt.Valid {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
				return
			}

			if err := a.Login(w, r, refreshToken.UserID); err != nil {
				http.Redirect(w, r, "/login", http.StatusSeeOther)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
