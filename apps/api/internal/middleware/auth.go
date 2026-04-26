package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

type userContext struct {
	userID uuid.UUID
}

type userContextKeyType string

const userContextKey userContextKeyType = "user_context"

func GetUserID(ctx context.Context) (uuid.UUID, bool) {
	userCtx, ok := ctx.Value(userContextKey).(*userContext)
	if !ok || userCtx == nil {
		return uuid.Nil, false
	}

	return userCtx.userID, true
}

type authenticator interface {
	ValidateJWT(token string) (uuid.UUID, error)
	GetRefreshToken(ctx context.Context, token string) (database.RefreshToken, error)
	Login(w http.ResponseWriter, r *http.Request, userID uuid.UUID) error
}

func Auth(a authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, err := tryJWT(a, r)
			if err != nil {
				userID, err = tryRefreshToken(a, w, r)
			}

			if err == nil {
				r = r.WithContext(
					context.WithValue(r.Context(), userContextKey, &userContext{
						userID: userID,
					}),
				)
			}

			next.ServeHTTP(w, r)
		})
	}
}

func tryJWT(a authenticator, r *http.Request) (uuid.UUID, error) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return uuid.Nil, err
	}

	return a.ValidateJWT(cookie.Value)
}

func tryRefreshToken(a authenticator, w http.ResponseWriter, r *http.Request) (uuid.UUID, error) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		return uuid.Nil, err
	}

	refresh, err := a.GetRefreshToken(r.Context(), cookie.Value)
	if err != nil {
		return uuid.Nil, err
	}

	if time.Now().After(refresh.ExpiresAt) || refresh.RevokedAt.Valid {
		return uuid.Nil, http.ErrNoCookie
	}

	if err := a.Login(w, r, refresh.UserID); err != nil {
		return uuid.Nil, err
	}

	return refresh.UserID, nil
}
