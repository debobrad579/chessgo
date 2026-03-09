package handlers

import "net/http"

func (cfg *Config) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("refresh_token"); err == nil {
		cfg.DB.RevokeRefreshToken(r.Context(), cookie.Value)
	}

	http.SetCookie(w, &http.Cookie{Name: "jwt", MaxAge: -1, Path: "/"})
	http.SetCookie(w, &http.Cookie{Name: "refresh_token", MaxAge: -1, Path: "/"})

	http.Redirect(w, r, "/", http.StatusSeeOther)
}
