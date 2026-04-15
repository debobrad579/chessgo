package handlers

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/auth"
	"github.com/debobrad579/chessgo/internal/database"
)

const maxJWTAge = 20 * time.Minute
const maxRefreshTokenAge = 30 * 24 * time.Hour

func (cfg *Config) ValidateJWT(token string) (uuid.UUID, error) {
	return auth.ValidateJWT(token, cfg.TokenSecret)
}

func (cfg *Config) GetRefreshToken(ctx context.Context, token string) (database.RefreshToken, error) {
	return cfg.DB.GetRefreshToken(ctx, token)
}

func (cfg *Config) Login(w http.ResponseWriter, r *http.Request, userID uuid.UUID) error {
	token, err := auth.MakeJWT(userID, cfg.TokenSecret, maxJWTAge)
	if err != nil {
		return err
	}

	refreshTokenString, err := auth.MakeRefreshToken()
	if err != nil {
		return err
	}

	if refreshCookie, err := r.Cookie("refresh_token"); err == nil {
		if err := cfg.DB.RevokeRefreshToken(r.Context(), refreshCookie.Value); err != nil && err != sql.ErrNoRows {
			return err
		}
	}

	refreshToken, err := cfg.DB.CreateRefreshToken(r.Context(), database.CreateRefreshTokenParams{Token: refreshTokenString, UserID: userID, ExpiresAt: time.Now().Add(maxRefreshTokenAge)})
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    token,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   int(maxJWTAge.Seconds()),
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken.Token,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   int(maxRefreshTokenAge.Seconds()),
	})

	return nil
}
