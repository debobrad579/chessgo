package handlers

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/middleware"
	"github.com/google/uuid"
)

const maxGuestAge = 30 * 24 * time.Hour

func (cfg *Config) getUser(ctx context.Context) (*database.User, error) {
	userID, ok := middleware.GetUserID(ctx)
	if !ok {
		return nil, errors.New("user not logged in")
	}

	user, err := cfg.DB.GetUser(ctx, userID)
	return &user, err
}

func (cfg *Config) getUserOrGuest(w http.ResponseWriter, r *http.Request) (*database.User, error) {
	user, err := cfg.getUser(r.Context())
	if err == nil {
		return user, nil
	}

	var guestID uuid.UUID

	guestCookie, err := r.Cookie("guest_id")
	if err == nil {
		guestID, err = uuid.Parse(guestCookie.Value)
	}

	if err != nil || guestID == uuid.Nil {
		guestID = uuid.New()
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "guest_id",
		Value:    guestID.String(),
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
		Path:     "/",
		MaxAge:   int(maxGuestAge.Seconds()),
	})

	return &database.User{
		ID:   guestID,
		Name: "Anonymous",
	}, nil
}
