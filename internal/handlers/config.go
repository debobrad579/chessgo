package handlers

import (
	"math/rand"

	"github.com/debobrad579/chessgo/internal/database"
)

type Config struct {
	DB          *database.Queries
	TokenSecret string
	RNG         *rand.Rand
}
