package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/httperr"
	"github.com/debobrad579/chessgo/internal/middleware"
)

type GameResponse struct {
	ID          uuid.UUID         `json:"id"`
	Moves       []chess.Move      `json:"moves,omitempty"`
	White       chess.Player      `json:"white"`
	Black       chess.Player      `json:"black"`
	ThinkTime   int               `json:"think_time"`
	TimeControl chess.TimeControl `json:"time_control"`
	Result      chess.Result      `json:"result"`
}

func (cfg *Config) MyGamesHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUser(r.Context())
	if !ok {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	pageNumberStr := r.URL.Query().Get("page_number")
	pageNumber, err := strconv.Atoi(pageNumberStr)
	if err != nil || pageNumber < 1 {
		pageNumber = 1
	}

	pageSizeStr := r.URL.Query().Get("page_size")
	pageSize, err := strconv.Atoi(pageSizeStr)
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	games, err := cfg.DB.GetGamesByUser(r.Context(), database.GetGamesByUserParams{
		ID:         uuid.NullUUID{UUID: user.ID, Valid: true},
		PageSize:   int32(pageSize),
		PageNumber: int32(pageNumber),
	})
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, err)
		return
	}

	response := make([]GameResponse, 0)

	for _, game := range games {
		var whiteID uuid.UUID
		if game.WhiteID.Valid {
			whiteID = game.WhiteID.UUID
		}

		var blackID uuid.UUID
		if game.BlackID.Valid {
			blackID = game.BlackID.UUID
		}

		whiteName := "Anonymous"
		if game.WhiteName.Valid {
			whiteName = game.WhiteName.String
		}

		blackName := "Anonymous"
		if game.BlackName.Valid {
			blackName = game.BlackName.String
		}

		response = append(response, GameResponse{
			ID: game.ID,
			White: chess.Player{
				ID:   whiteID,
				Name: whiteName,
			},
			Black: chess.Player{
				ID:   blackID,
				Name: blackName,
			},
			TimeControl: chess.TimeControl{
				Base:      int(game.TimeControlBase),
				Increment: int(game.TimeControlIncrement),
			},
			Result: chess.Result(game.Result),
		})
	}

	data, err := json.Marshal(response)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, err)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) GetGamesCountHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := middleware.GetUser(r.Context())
	if !ok {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	count, err := cfg.DB.GetGamesCount(r.Context(), uuid.NullUUID{UUID: user.ID, Valid: true})
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to fetch count: %w", err))
		return
	}

	data, err := json.Marshal(count)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to encode response: %w", err))
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) GameHandler(w http.ResponseWriter, r *http.Request) {
	gameIDStr := r.PathValue("gameID")

	gameID, err := uuid.Parse(gameIDStr)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusNotFound, errors.New("invalid game ID"))
		return
	}

	game, err := cfg.DB.GetGame(r.Context(), gameID)
	if err != nil {
		if err == sql.ErrNoRows {
			httperr.Write(r.Context(), w, http.StatusNotFound, errors.New("game not found"))
			return
		}
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to get game: %w", err))
		return
	}

	var moves []chess.Move
	if err := json.Unmarshal(game.Moves, &moves); err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to unmarshal moves: %w", err))
		return
	}

	var whiteID uuid.UUID
	if game.WhiteID.Valid {
		whiteID = game.WhiteID.UUID
	}

	var blackID uuid.UUID
	if game.BlackID.Valid {
		blackID = game.BlackID.UUID
	}

	whiteName := "Anonymous"
	if game.WhiteName.Valid {
		whiteName = game.WhiteName.String
	}

	blackName := "Anonymous"
	if game.BlackName.Valid {
		blackName = game.BlackName.String
	}

	data, err := json.Marshal(GameResponse{
		ID:    gameID,
		Moves: moves,
		White: chess.Player{
			ID:   whiteID,
			Name: whiteName,
		},
		Black: chess.Player{
			ID:   blackID,
			Name: blackName,
		},
		TimeControl: chess.TimeControl{
			Base:      int(game.TimeControlBase),
			Increment: int(game.TimeControlIncrement),
		},
		Result: chess.Result(game.Result),
	})
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to marshal game: %w", err))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
