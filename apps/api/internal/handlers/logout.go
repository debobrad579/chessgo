package handlers

import "net/http"

type logoutResponse struct {
	Success bool `json:"success"`
}

func (cfg *Config) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie("refresh_token"); err == nil {
		if err = cfg.DB.RevokeRefreshToken(r.Context(), cookie.Value); err != nil {
			writeJSON(w, http.StatusInternalServerError, logoutResponse{
				Success: false,
			})
		}
	}

	clearCookie := func(name string) {
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Secure:   true,
		})
	}

	clearCookie("jwt")
	clearCookie("refresh_token")

	writeJSON(w, http.StatusOK, logoutResponse{
		Success: true,
	})
}
