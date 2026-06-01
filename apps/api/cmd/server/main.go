package main

import (
	"database/sql"
	"fmt"
	"log"
	"log/slog"
	"math/rand"
	"os"
	"strconv"
	"time"

	"github.com/debobrad579/chessgo/internal/database"
	"github.com/debobrad579/chessgo/internal/handlers"
	"github.com/debobrad579/chessgo/internal/logging"
	"github.com/debobrad579/chessgo/internal/polyglot"
	"github.com/joho/godotenv"
	"github.com/mattn/go-isatty"

	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load()

	polyglot.InitializeBookData(os.Getenv("POLYGLOT_BOOK_FILEPATH"))

	dev, _ := strconv.ParseBool(os.Getenv("DEV"))

	var logger *logging.Logger
	var err error

	if dev {
		logger, err = logging.InitializeLogger(logging.LoggerOptions{
			Level:  slog.LevelDebug,
			Writer: os.Stderr,
			NoColor: !(isatty.IsTerminal(os.Stderr.Fd()) ||
				isatty.IsCygwinTerminal(os.Stderr.Fd())),
		})
	} else {
		logger, err = logging.InitializeLogger(logging.LoggerOptions{
			Level:  slog.LevelInfo,
			Writer: os.Stdout,
			JSON:   true,
		})
	}
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}

	portStr := os.Getenv("PORT")
	port := 8080
	if portStr != "" {
		port, err = strconv.Atoi(os.Getenv("PORT"))
		if err != nil {
			logger.Fatal("invalid port", slog.Any("error", err))
		}
	}

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
		logger.Fatal("failed to open database",
			slog.Any("error", err),
			slog.String("host", os.Getenv("POSTGRES_HOST")),
			slog.String("port", os.Getenv("POSTGRES_PORT")),
			slog.String("db", os.Getenv("POSTGRES_DB")),
		)
	}

	cfg := &handlers.Config{
		DB:          database.New(db),
		TokenSecret: os.Getenv("TOKEN_SECRET"),
		RNG:         rand.New(rand.NewSource(time.Now().UnixNano())),
		Logger:      logger,
	}

	logger.Info("starting server", slog.Int("port", port))
	if err := startServer(cfg, port, os.Getenv("APP_ORIGIN"), os.Getenv("WWW_ORIGIN")); err != nil {
		logger.Fatal("failed to start server", slog.Any("error", err))
	}
}
