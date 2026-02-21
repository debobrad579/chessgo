package handlers

import "net/http"

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

func (cfg *Config) LoginPostHandler(w http.ResponseWriter, r *http.Request) {
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
		RenderTemplate(w, "login.html", data)
	} else {
		http.Redirect(w, r, "/app", http.StatusSeeOther)
	}
}
