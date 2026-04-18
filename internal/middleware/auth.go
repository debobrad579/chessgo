package middleware

import (
	"context"
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

type userContext struct {
	user *database.User
}

type userContextKeyType string

const userContextKey userContextKeyType = "user_context"

func GetUser(ctx context.Context) (*database.User, bool) {
	userCtx, ok := ctx.Value(userContextKey).(*userContext)
	if !ok || userCtx == nil {
		return nil, false
	}

	return userCtx.user, true
}

type authenticator interface {
	ValidateJWT(token string) (uuid.UUID, error)
	GetRefreshToken(ctx context.Context, token string) (database.RefreshToken, error)
	Login(w http.ResponseWriter, r *http.Request, userID uuid.UUID) error
	GetUser(ctx context.Context, id uuid.UUID) (database.User, error)
}

func Auth(a authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, err := tryJWT(a, r)
			if err != nil {
				user, err = tryRefreshToken(a, w, r)
			}

			if err == nil && user != nil {
				ctx := context.WithValue(r.Context(), userContextKey, &userContext{
					user: user,
				})
				r = r.WithContext(ctx)
			}

			next.ServeHTTP(w, r)
		})
	}
}

func tryJWT(a authenticator, r *http.Request) (*database.User, error) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return nil, err
	}

	userID, err := a.ValidateJWT(cookie.Value)
	if err != nil {
		return nil, err
	}

	user, err := a.GetUser(r.Context(), userID)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func tryRefreshToken(a authenticator, w http.ResponseWriter, r *http.Request) (*database.User, error) {
	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		return nil, err
	}

	refresh, err := a.GetRefreshToken(r.Context(), cookie.Value)
	if err != nil {
		return nil, err
	}

	if time.Now().After(refresh.ExpiresAt) || refresh.RevokedAt.Valid {
		return nil, http.ErrNoCookie
	}

	if err := a.Login(w, r, refresh.UserID); err != nil {
		return nil, err
	}

	user, err := a.GetUser(r.Context(), refresh.UserID)
	if err != nil {
		return nil, err
	}

	return &user, nil
}
