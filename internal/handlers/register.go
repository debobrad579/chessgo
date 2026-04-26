package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/debobrad579/chessgo/internal/appmetrics"
	"github.com/debobrad579/chessgo/internal/auth"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/lib/pq"
)

type registerResponse struct {
	Success bool `json:"success"`
	Errors  struct {
		Name            string `json:"name,omitempty"`
		Email           string `json:"email,omitempty"`
		Password        string `json:"password,omitempty"`
		ConfirmPassword string `json:"confirm_password,omitempty"`
	} `json:"errors,omitempty"`
}

func (cfg *Config) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name            string `json:"name"`
		Email           string `json:"email"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirm_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, registerResponse{
			Success: false,
		})
		return
	}

	name := body.Name
	email := body.Email
	password := body.Password
	confirmPassword := body.ConfirmPassword

	var resp registerResponse

	if name == "" {
		resp.Errors.Name = "Required"
	}

	if email == "" {
		resp.Errors.Email = "Required"
	} else if !isEmailValid(email) {
		resp.Errors.Email = "Invalid email address"
	}

	if password == "" {
		resp.Errors.Password = "Required"
	} else if len(password) < 8 {
		resp.Errors.Password = "Must be at least 8 characters long"
	}

	if confirmPassword == "" {
		resp.Errors.ConfirmPassword = "Required"
	} else if confirmPassword != password {
		resp.Errors.ConfirmPassword = "Passwords do not match"
	}

	if resp.Errors.Name != "" ||
		resp.Errors.Email != "" ||
		resp.Errors.Password != "" ||
		resp.Errors.ConfirmPassword != "" {
		writeJSON(w, http.StatusUnprocessableEntity, resp)
		return
	}

	hashedPassword, err := auth.HashPassword(password)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, registerResponse{
			Success: false,
		})
		return
	}

	user, err := cfg.DB.CreateUser(r.Context(), database.CreateUserParams{
		Email:          email,
		Name:           name,
		HashedPassword: hashedPassword,
	})

	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
			resp.Errors.Email = "Email already in use"
			writeJSON(w, http.StatusConflict, resp)
			return
		}

		writeJSON(w, http.StatusInternalServerError, registerResponse{
			Success: false,
		})
		return
	}

	appmetrics.NewUsersTotal.Inc()

	if err := cfg.Login(w, r, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, registerResponse{
			Success: false,
		})
		return
	}

	writeJSON(w, http.StatusOK, registerResponse{
		Success: true,
	})
}
