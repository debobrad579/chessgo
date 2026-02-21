package handlers

import (
	"net/http"
	"regexp"

	"github.com/debobrad579/chessgo/utils"
)

func isEmailValid(e string) bool {
	emailRegex := regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)
	return emailRegex.MatchString(e)
}

type LoginData struct {
	Fields struct {
		Email    string
		Password string
	}
	Errors struct {
		Email    string
		Password string
	}
}

func LoginPostHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		http.Error(w, "Error parsing form", http.StatusInternalServerError)
		return
	}

	email := r.FormValue("email")
	password := r.FormValue("password")

	var data LoginData
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
		utils.RenderTemplate(w, "login.html", data)
	} else {
		http.Redirect(w, r, "/app", http.StatusSeeOther)
	}
}

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

func RegisterPostHandler(w http.ResponseWriter, r *http.Request) {
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
		utils.RenderTemplate(w, "register.html", data)
	} else {
		http.Redirect(w, r, "/app", http.StatusSeeOther)
	}
}
