package handlers

import (
	"net/http"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/lib/pq"
)

type RegisterData struct {
	Fields struct {
		Name            string
		Email           string
		Password        string
		ConfirmPassword string
	}
	Errors struct {
		Name            string
		Email           string
		Password        string
		ConfirmPassword string
	}
}

func (cfg *Config) RegisterPostHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Error parsing form", http.StatusInternalServerError)
		return
	}

	name := r.FormValue("name")
	email := r.FormValue("email")
	password := r.FormValue("password")
	confirmPassword := r.FormValue("confirm-password")

	var data RegisterData
	data.Fields.Name = name
	data.Fields.Email = email
	data.Fields.Password = password
	data.Fields.ConfirmPassword = confirmPassword

	if name == "" {
		data.Errors.Name = "Required"
	}

	if email == "" {
		data.Errors.Email = "Required"
	} else if !isEmailValid(email) {
		data.Errors.Email = "Invalid email address"
	}

	if password == "" {
		data.Errors.Password = "Required"
	} else if len(password) < 8 {
		data.Errors.Password = "Must be at least 8 characters long."
	}

	if confirmPassword == "" {
		data.Errors.ConfirmPassword = "Required"
	} else if confirmPassword != password {
		data.Errors.ConfirmPassword = "Passwords do not match."
	}

	if data.Errors.Name != "" || data.Errors.Email != "" || data.Errors.Password != "" || data.Errors.ConfirmPassword != "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		RenderTemplate(w, "register.html", data)
		return
	}

	_, err := cfg.DB.CreateUser(r.Context(), database.CreateUserParams{Email: email, Name: name})
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" {
				w.WriteHeader(http.StatusConflict)
				data.Errors.Email = "Email already in use"
				RenderTemplate(w, "register.html", data)
				return
			}
		}

		w.WriteHeader(http.StatusInternalServerError)
		data.Errors.Email = "Internal server error"
		RenderTemplate(w, "register.html", data)
		return
	}

	http.Redirect(w, r, "/app", http.StatusSeeOther)
}
