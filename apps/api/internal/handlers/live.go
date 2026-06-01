package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math/rand/v2"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/httperr"
	"github.com/debobrad579/chessgo/internal/live"
)

type newGameOptions struct {
	Color       string `json:"color"`
	TimeControl string `json:"time_control"`
}

type clientMessageType string

const (
	typeMove           clientMessageType = "move"
	typeResign         clientMessageType = "resign"
	typeDrawOffer      clientMessageType = "draw_offer"
	typeDrawResponse   clientMessageType = "draw_response"
	typeRematchRequest clientMessageType = "rematch_request"
	typePing           clientMessageType = "ping"
)

type clientMessage struct {
	Type    clientMessageType `json:"type"`
	Payload json.RawMessage   `json:"payload"`
}

func (cfg *Config) CreateLiveGameHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, err)
		return
	}

	defer r.Body.Close()

	var gameOptions newGameOptions

	if err = json.NewDecoder(r.Body).Decode(&gameOptions); err != nil {
		httperr.Write(r.Context(), w, http.StatusBadRequest, fmt.Errorf("failed to decode game options: %w", err))
		return
	}

	playerColor := chess.White
	if gameOptions.Color == "black" ||
		(gameOptions.Color == "random" && rand.IntN(2) == 1) {
		playerColor = chess.Black
	}

	baseStr, incrementStr, found := strings.Cut(gameOptions.TimeControl, "+")
	if !found {
		httperr.Write(r.Context(), w, http.StatusBadRequest, errors.New("invalid time control"))
		return
	}

	base, err := strconv.Atoi(baseStr)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusBadRequest, errors.New("invalid time control"))
		return
	}

	increment, err := strconv.Atoi(incrementStr)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusBadRequest, errors.New("invalid time control"))
		return
	}

	data, err := live.New(user, cfg.DB, playerColor, chess.TimeControl{Base: base * 60 * 1000, Increment: increment * 1000})
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, fmt.Errorf("failed to create live game room: %w", err))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) ConnectToLiveGameHandler(w http.ResponseWriter, r *http.Request) {
	gameIDStr := r.PathValue("gameID")

	gameID, err := uuid.Parse(gameIDStr)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusBadRequest, errors.New("invalid game ID"))
		return
	}

	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	room, err := live.GetGameRoom(gameID)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusNotFound, errors.New("game room not found"))
		return
	}

	conn, playerRole := room.Connect(w, r, user)
	if conn == nil {
		return
	}
	defer room.Disconnect(user)

	cfg.Logger.Info("connected to game room",
		slog.String("room_id", room.ID.String()),
		slog.String("user_id", user.ID.String()),
		slog.Bool("is_guest", user.Email == ""),
		slog.String("player_role", string(playerRole)),
	)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			cfg.Logger.Error("failed to read message", slog.Any("error", err), slog.Any("message", message))
			return
		}

		var clientMessage clientMessage
		if err := json.Unmarshal(message, &clientMessage); err != nil {
			cfg.Logger.Error("failed to unmarshal message", slog.Any("error", err), slog.Any("message", message))
			return
		}

		cfg.Logger.Info("recieved message",
			slog.String("game_type", "live"),
			slog.String("message_type", string(clientMessage.Type)),
			slog.String("room_id", room.ID.String()),
			slog.String("player", string(playerRole)),
		)

		switch clientMessage.Type {
		case typeMove:
			var move chess.Move
			if err := json.Unmarshal(clientMessage.Payload, &move); err != nil {
				cfg.Logger.Error("invalid move structure", slog.Any("error", err), slog.Any("payload", clientMessage.Payload))
				return
			}

			room.MakeMove(move, playerRole)
		case typeResign:
			room.Resign(playerRole)
		case typeDrawOffer:
			room.OfferDraw(playerRole)
		case typeDrawResponse:
			var accept struct {
				Accept bool `json:"accept"`
			}
			if err := json.Unmarshal(clientMessage.Payload, &accept); err != nil {
				cfg.Logger.Error("invalid draw response structure", slog.Any("error", err), slog.Any("payload", clientMessage.Payload))
				return
			}

			room.RespondToDraw(playerRole, accept.Accept)
		case typeRematchRequest:
			room.RequestRematch(playerRole)
		case typePing:
		default:
			cfg.Logger.Error("invalid client message type", slog.Any("error", err), slog.Any("type", clientMessage.Type))
		}
	}
}

func (cfg *Config) GetLiveGamesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		httperr.Write(r.Context(), w, http.StatusInternalServerError, errors.New("streaming unsupported"))
		return
	}

	ch := live.Subscribe()
	defer live.Unsubscribe(ch)

	sendSnapshot(w, flusher)

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ch:
			sendSnapshot(w, flusher)
		}
	}
}

func sendSnapshot(w http.ResponseWriter, flusher http.Flusher) {
	data, err := json.Marshal(live.GetGamesList())
	if err != nil {
		return
	}
	fmt.Fprintf(w, "data: %s\n\n", data)
	flusher.Flush()
}
