package logging

import (
	"context"
	"io"
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
)

const LevelFatal = slog.LevelError + 4

type Logger struct {
	*slog.Logger
}

func (l *Logger) Fatal(msg string, args ...any) {
	l.Log(context.Background(), LevelFatal, msg, args...)
	os.Exit(1)
}

type LoggerOptions struct {
	Writer  io.Writer
	Level   slog.Level
	JSON    bool
	NoColor bool
}

func InitializeLogger(opts LoggerOptions) (*Logger, error) {
	var handler slog.Handler

	if opts.JSON {
		handler = slog.NewJSONHandler(opts.Writer, &slog.HandlerOptions{
			Level:       opts.Level,
			ReplaceAttr: replaceAttr,
		})
	} else {
		handler = tint.NewHandler(opts.Writer, &tint.Options{
			Level:   opts.Level,
			NoColor: opts.NoColor,
			ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
				if a.Value.Kind() == slog.KindAny {
					if _, ok := a.Value.Any().(error); ok {
						return replaceAttr(groups, tint.Attr(9, a))
					}
				}

				return replaceAttr(groups, a)
			},
		})
	}

	return &Logger{slog.New(handler)}, nil
}

func replaceAttr(groups []string, a slog.Attr) slog.Attr {
	if a.Key == slog.LevelKey && len(groups) == 0 {
		level, ok := a.Value.Any().(slog.Level)
		if ok && level == LevelFatal {
			return tint.Attr(13, slog.String(a.Key, "FATAL"))
		}
	}

	return a
}
