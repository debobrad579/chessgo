package handlers

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/debobrad579/chessgo/internal/bot"
	"github.com/debobrad579/chessgo/internal/chess"
	"github.com/debobrad579/chessgo/internal/httperr"
)

func (cfg *Config) ConnectToBotHandler(w http.ResponseWriter, r *http.Request) {
	user, err := cfg.getUserOrGuest(w, r)
	if err != nil {
		httperr.Write(r.Context(), w, http.StatusUnauthorized, errors.New("unauthorized"))
		return
	}

	conn, room := bot.Connect(w, r, user.ID)
	if conn == nil {
		return
	}
	defer bot.Disconnect(user.ID)

	cfg.Logger.Info("connected to bot game room",
		slog.String("user_id", user.ID.String()),
		slog.Bool("is_guest", user.Email == ""),
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
			slog.String("type", string(clientMessage.Type)),
			slog.String("player_id", user.ID.String()),
		)

		switch clientMessage.Type {
		case typeMove:
			var move chess.Move
			if err := json.Unmarshal(clientMessage.Payload, &move); err != nil {
				cfg.Logger.Error("invalid move structure", slog.Any("error", err), slog.Any("payload", clientMessage.Payload))
				return
			}

			err := room.MakeMove(move, chess.White)
			if err != nil {
				cfg.Logger.Error("error making move", slog.Any("error", err))
			}
		case typeResign:
			// room.Resign(playerRole)
		case typePing:
		default:
			cfg.Logger.Error("invalid client message type", slog.Any("error", err), slog.Any("type", clientMessage.Type))
		}
	}
}
