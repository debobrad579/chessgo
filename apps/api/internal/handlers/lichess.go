package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/debobrad579/chessgo/internal/auth"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/httperr"
	"github.com/debobrad579/chessgo/internal/middleware"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

func lichessConfig(r *http.Request) *oauth2.Config {
	scheme := "https"
	if r.TLS == nil && r.Header.Get("X-Forwarded-Proto") != "https" {
		scheme = "http"
	}
	redirectURL := fmt.Sprintf("%s://%s/lichess/callback", scheme, r.Host)

	return &oauth2.Config{
		ClientID: "chessgo-ca",
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://lichess.org/oauth",
			TokenURL: "https://lichess.org/api/token",
		},
		RedirectURL: redirectURL,
		Scopes:      []string{"board:play"},
	}
}

var pendingLichessOAuth = map[string]pendingAuthEntry{}

type pendingAuthEntry struct {
	UserID   uuid.UUID
	Verifier string
	Expiry   time.Time
}

func randomString(n int) string {
	b := make([]byte, n)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func (cfg *Config) LinkLichessAccountHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("user not logged in"))
		return
	}

	verifier := oauth2.GenerateVerifier()
	state := randomString(24)

	pendingLichessOAuth[state] = pendingAuthEntry{
		UserID:   userID,
		Verifier: verifier,
		Expiry:   time.Now().Add(10 * time.Minute),
	}

	authURL := lichessConfig(r).AuthCodeURL(
		state,
		oauth2.S256ChallengeOption(verifier),
	)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"authURL": authURL})
}

func (cfg *Config) LichessCallbackHandler(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	entry, ok := pendingLichessOAuth[state]
	if !ok || time.Now().After(entry.Expiry) {
		httperr.Write(r.Context(), w, http.StatusForbidden, errors.New("token expired"))
		return
	}
	delete(pendingLichessOAuth, state)

	lichessOAuthConfig := lichessConfig(r)

	token, err := lichessOAuthConfig.Exchange(
		r.Context(), code,
		oauth2.VerifierOption(entry.Verifier),
	)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to get token: %w", err))
		return
	}

	client := lichessOAuthConfig.Client(r.Context(), token)

	resp, err := client.Get("https://lichess.org/api/account")
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to get account information: %w", err))
		return
	}
	defer resp.Body.Close()

	var account struct {
		ID       string `json:"id"`
		Username string `json:"username"`
	}
	json.NewDecoder(resp.Body).Decode(&account)

	encryptedToken, err := auth.EncryptToken([]byte(token.AccessToken))
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to encrypt token: %w", err))
		return
	}

	cfg.DB.LinkLichessAccount(r.Context(),
		database.LinkLichessAccountParams{
			UserID:         entry.UserID,
			ID:             account.ID,
			Username:       account.Username,
			EncryptedToken: encryptedToken,
			ExpiresAt:      token.Expiry,
		},
	)

	http.Redirect(w, r, os.Getenv("APP_ORIGIN"), http.StatusFound)
}

func (cfg *Config) UnlinkLichessAccountHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("user not logged in"))
		return
	}

	account, err := cfg.DB.GetLichessAccount(r.Context(), userID)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to get lichess account: %w", err))
		return
	}

	tokenString, err := auth.DecryptToken(account.EncryptedToken)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to decrypt token: %w", err))
		return
	}

	req, err := http.NewRequest(http.MethodDelete, "https://lichess.org/api/token", nil)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to create request: %w", err))
		return
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", tokenString))
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to request lichess: %w", err))
		return
	}
	defer resp.Body.Close()

	cfg.DB.UnlinkLichessAccount(r.Context(), userID)

	body, _ := io.ReadAll(resp.Body)
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

type lichessAccountResponse struct {
	Connected   bool   `json:"connected"`
	ID          string `json:"id,omitempty"`
	Username    string `json:"username,omitempty"`
	AccessToken string `json:"access_token,omitempty"`
}

func (cfg *Config) GetLichessAccountHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r.Context())
	if !ok {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lichessAccountResponse{Connected: false})
		return
	}

	account, err := cfg.DB.GetLichessAccount(r.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(lichessAccountResponse{Connected: false})
		} else {
			httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to get lichess account: %w", err))
		}
		return
	}

	if time.Now().After(account.ExpiresAt) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(lichessAccountResponse{Connected: false})
		return
	}

	token, err := auth.DecryptToken(account.EncryptedToken)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to decrypt token: %w", err))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(
		lichessAccountResponse{
			Connected:   true,
			ID:          account.ID,
			Username:    account.Username,
			AccessToken: string(token),
		},
	)
}
