package handlers

import (
	"net/http"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/middleware"
	"github.com/google/uuid"
)

const maxGuestAge = 30 * 24 * time.Hour

func (cfg *Config) getUserOrGuest(w http.ResponseWriter, r *http.Request) (*database.User, error) {
	user, ok := middleware.GetUser(r.Context())
	if ok {
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
