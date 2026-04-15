package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"math/rand"
	"os"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/handlers"
	"github.com/debobrad579/chessgo/internal/logging"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load()

	logger, closeFunc, err := logging.InitializeLogger("")
	if err != nil {
		slog.Error("failed to initialize logger", slog.Any("error", err))
	}
	defer func() {
		if err := closeFunc(); err != nil {
			slog.Error("failed to close logger", slog.Any("error", err))
		}
	}()

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_PORT"),
		os.Getenv("POSTGRES_DB"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		logger.Error("failed to open database",
			slog.String("host", os.Getenv("POSTGRES_HOST")),
			slog.String("port", os.Getenv("POSTGRES_PORT")),
			slog.String("db", os.Getenv("POSTGRES_DB")),
		)
		os.Exit(1)
	}

	cfg := &handlers.Config{
		DB:          database.New(db),
		TokenSecret: os.Getenv("TOKEN_SECRET"),
		RNG:         rand.New(rand.NewSource(time.Now().UnixNano())),
		Logger:      logger,
	}

	port := ":" + os.Getenv("PORT")
	if port == ":" {
		port = ":3000"
	}

	dev := os.Getenv("DEV") == "true"

	logger.Debug("starting server", slog.String("port", port), slog.Bool("dev", dev))
	if err := startServer(cfg, port, dev); err != nil {
		logger.Error("failed to start server")
		os.Exit(1)
	}
}
