package handlers

import (
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/auth"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/google/uuid"
)

func (cfg *Config) getUser(r *http.Request) (*database.User, error) {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return nil, nil
	}

	userID, err := auth.ValidateJWT(cookie.Value, cfg.TokenSecret)
	if err != nil {
		return nil, err
	}

	user, err := cfg.DB.GetUser(r.Context(), userID)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

const maxGuestAge = 30 * 24 * time.Hour

func (cfg *Config) getUserOrGuest(w http.ResponseWriter, r *http.Request) (*database.User, error) {
	user, err := cfg.getUser(r)
	if err != nil {
		return nil, err
	}
	if user != nil {
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
