package handlers

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"regexp"

	"github.com/debobrad579/chessgo/internal/auth"
	"github.com/debobrad579/chessgo/internal/httperr"
)

type loginData struct {
	Fields struct {
		Email    string
		Password string
	}
	Errors struct {
		Email    string
		Password string
	}
	AuthError string
}

func isEmailValid(e string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return emailRegex.MatchString(e)
}

func (cfg *Config) LoginPostHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("error parsing form: %w", err))
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")

	var data loginData
	data.Fields.Email = email
	data.Fields.Password = password

	if email == "" {
		data.Errors.Email = "Required"
	} else if !isEmailValid(email) {
		data.Errors.Email = "Invalid email address"
	}

	if password == "" {
		data.Errors.Password = "Required"
	}

	if data.Errors.Email != "" || data.Errors.Password != "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		RenderTemplate(r.Context(), w, "login.html", data)
		return
	}

	user, err := cfg.DB.GetUserByEmail(r.Context(), data.Fields.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			loginError(r.Context(), w, data, http.StatusUnauthorized, "Email or password is incorrect")
			return
		}
		loginError(r.Context(), w, data, http.StatusInternalServerError, "Failed to get user")
		return
	}

	ok, err := auth.CheckPasswordHash(data.Fields.Password, user.HashedPassword)

	if err != nil {
		loginError(r.Context(), w, data, http.StatusInternalServerError, "Failed to verify password")
		return
	}

	if !ok {
		loginError(r.Context(), w, data, http.StatusUnauthorized, "Email or password is incorrect")
		return
	}

	if err := cfg.Login(w, r, user.ID); err != nil {
		loginError(r.Context(), w, data, http.StatusInternalServerError, "Failed to log in")
		return
	}

	http.Redirect(w, r, "/app", http.StatusSeeOther)
}

func loginError(ctx context.Context, w http.ResponseWriter, data loginData, code int, message string) {
	data.AuthError = message
	w.WriteHeader(code)
	RenderTemplate(ctx, w, "login.html", data)
}
