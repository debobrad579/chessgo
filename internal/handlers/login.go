package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/debobrad579/chessgo/internal/auth"
)

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func isEmailValid(e string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return emailRegex.MatchString(e)
}

type loginResponse struct {
	Success bool `json:"success"`
	Errors  struct {
		Email    string `json:"email,omitempty"`
		Password string `json:"password,omitempty"`
	} `json:"errors,omitempty"`
}

func (cfg *Config) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, loginResponse{
			Success: false,
		})
		return
	}

	email := body.Email
	password := body.Password

	var resp loginResponse

	if email == "" {
		resp.Errors.Email = "Required"
	} else if !isEmailValid(email) {
		resp.Errors.Email = "Invalid email address"
	}

	if password == "" {
		resp.Errors.Password = "Required"
	}

	if resp.Errors.Email != "" || resp.Errors.Password != "" {
		writeJSON(w, http.StatusUnprocessableEntity, resp)
		return
	}

	user, err := cfg.DB.GetUserByEmail(r.Context(), email)
	if err != nil {
		if err == sql.ErrNoRows {
			resp.Errors.Password = "Email or password is incorrect"
			writeJSON(w, http.StatusUnauthorized, resp)
			return
		}

		resp.Errors.Password = "Failed to get user"
		writeJSON(w, http.StatusInternalServerError, resp)
		return
	}

	ok, err := auth.CheckPasswordHash(password, user.HashedPassword)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, loginResponse{
			Success: false,
		})
		return
	}

	if !ok {
		resp.Errors.Password = "Email or password is incorrect"
		writeJSON(w, http.StatusUnauthorized, resp)
		return
	}

	if err := cfg.Login(w, r, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, loginResponse{
			Success: false,
		})
		return
	}

	writeJSON(w, http.StatusOK, loginResponse{
		Success: true,
	})
}
