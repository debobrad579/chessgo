package handlers

import (
	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/logging"
)

type Config struct {
	DB          *database.Queries
	TokenSecret string
	Logger      *logging.Logger
}
