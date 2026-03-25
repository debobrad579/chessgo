package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"

	"github.com/debobrad579/chessgo/internal/chess"
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
)

type clientMessage struct {
	Type    clientMessageType `json:"type"`
	Payload json.RawMessage   `json:"payload"`
}

func (cfg *Config) NewGameHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer r.Body.Close()

	var gameOptions newGameOptions

	if err = json.NewDecoder(r.Body).Decode(&gameOptions); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	playerColor := chess.White
	if gameOptions.Color == "black" ||
		(gameOptions.Color == "random" && cfg.RNG.Intn(2) == 1) {
		playerColor = chess.Black
	}

	baseStr, incrementStr, found := strings.Cut(gameOptions.TimeControl, "+")
	if !found {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	base, err := strconv.Atoi(baseStr)
	if err != nil {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	increment, err := strconv.Atoi(incrementStr)
	if err != nil {
		http.Error(w, "Invalid time control format", http.StatusBadRequest)
		return
	}

	data, err := live.New(user, cfg.DB, playerColor, chess.TimeControl{Base: base * 60 * 1000, Increment: increment * 1000})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func (cfg *Config) ConnectToGameHandler(w http.ResponseWriter, r *http.Request) {
	gameIDStr := r.PathValue("gameID")

	gameID, err := uuid.Parse(gameIDStr)
	if err != nil {
		http.Error(w, "invalid game ID", http.StatusBadRequest)
		return
	}

	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	room, err := live.GetGameRoom(gameID)
	if err != nil {
		http.Error(w, "game room not found", http.StatusNotFound)
		return
	}

	conn, playerRole := room.Connect(w, r, user)
	if conn == nil {
		return
	}
	defer room.Disconnect(user)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			return
		}

		var clientMessage clientMessage
		if err := json.Unmarshal(message, &clientMessage); err != nil {
			log.Println("failed to unmarshal message")
			return
		}

		switch clientMessage.Type {
		case typeMove:
			var move chess.Move
			if err := json.Unmarshal(clientMessage.Payload, &move); err != nil {
				log.Println("invalid move structure")
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
				log.Println("invalid draw response structure")
				return
			}

			room.RespondToDraw(playerRole, accept.Accept)
		case typeRematchRequest:
			room.RequestRematch(playerRole)
		default:
			log.Println("invalid client message type")
		}
	}
}

func (cfg *Config) GamesListHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
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
