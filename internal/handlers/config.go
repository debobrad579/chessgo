package handlers

import (
	"math/rand"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/logging"
)

type Config struct {
	DB          *database.Queries
	TokenSecret string
	RNG         *rand.Rand
	Logger      *logging.Logger
}
