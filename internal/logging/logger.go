package logging

import (
	"io"
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
	"github.com/mattn/go-isatty"
)

type LoggerOptions struct {
	JSONOut io.Writer
	Level   slog.Level
}

func InitializeLogger(opts LoggerOptions) (*slog.Logger, error) {
	var handlers []slog.Handler

	handlers = append(handlers, tint.NewHandler(os.Stderr, &tint.Options{
		Level: opts.Level,
		NoColor: !(isatty.IsTerminal(os.Stderr.Fd()) ||
			isatty.IsCygwinTerminal(os.Stderr.Fd())),
	}))

	if opts.JSONOut != nil {
		handlers = append(handlers, slog.NewJSONHandler(opts.JSONOut, &slog.HandlerOptions{
			Level: opts.Level,
		}))
	}

	return slog.New(slog.NewMultiHandler(handlers...)), nil
}
