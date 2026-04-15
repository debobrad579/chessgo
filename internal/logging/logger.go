package logging

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
	"github.com/mattn/go-isatty"
)

func InitializeLogger(logFile string) (logger *slog.Logger, closeFunc func() error, err error) {
	var handlers []slog.Handler

	handlers = append(handlers, tint.NewHandler(os.Stderr, &tint.Options{
		Level:   slog.LevelDebug,
		NoColor: !(isatty.IsTerminal(os.Stderr.Fd()) || isatty.IsCygwinTerminal(os.Stderr.Fd())),
	}))

	if logFile != "" {
		file, err := os.OpenFile(logFile, os.O_WRONLY|os.O_CREATE|os.O_APPEND, 0x666)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to open log file: %w", err)
		}

		bufferedFile := bufio.NewWriter(file)

		handlers = append(handlers, slog.NewJSONHandler(bufferedFile, nil))

		closeFunc = func() error {
			if err := bufferedFile.Flush(); err != nil {
				return fmt.Errorf("failed to flush log file: %w", err)
			}
			if err := file.Close(); err != nil {
				return fmt.Errorf("failed to close log file: %w", err)
			}
			return nil
		}
	} else {
		closeFunc = func() error { return nil }
	}

	return slog.New(slog.NewMultiHandler(handlers...)), closeFunc, nil
}
