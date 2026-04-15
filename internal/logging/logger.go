package logging

import (
	"context"
	"io"
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
	"github.com/mattn/go-isatty"
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
	JSONOut io.Writer
	Level   slog.Level
}

func InitializeLogger(opts LoggerOptions) (*Logger, error) {
	var handlers []slog.Handler

	handlers = append(handlers, tint.NewHandler(os.Stderr, &tint.Options{
		Level: opts.Level,
		NoColor: !(isatty.IsTerminal(os.Stderr.Fd()) ||
			isatty.IsCygwinTerminal(os.Stderr.Fd())),
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Value.Kind() == slog.KindAny {
				if _, ok := a.Value.Any().(error); ok {
					return replaceAttr(groups, tint.Attr(9, a))
				}
			}
			return replaceAttr(groups, a)
		},
	}))

	if opts.JSONOut != nil {
		handlers = append(handlers, slog.NewJSONHandler(opts.JSONOut, &slog.HandlerOptions{
			Level:       opts.Level,
			ReplaceAttr: replaceAttr,
		}))
	}

	return &Logger{slog.New(slog.NewMultiHandler(handlers...))}, nil
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
