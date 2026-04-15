package middleware

import (
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/debobrad579/chessgo/internal/httperr"
	"github.com/debobrad579/chessgo/internal/logging"
)

type responseWriterWithStatus struct {
	http.ResponseWriter
	statusCode int
}

func (w *responseWriterWithStatus) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

func RequestLogger(logger *logging.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if isStreamingRequest(r) {
				next.ServeHTTP(w, r)
				return
			}

			start := time.Now()
			writerWithStatus := &responseWriterWithStatus{ResponseWriter: w}
			r = r.WithContext(httperr.NewContext(r.Context()))
			next.ServeHTTP(writerWithStatus, r)

			attrs := []any{
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", writerWithStatus.statusCode),
				slog.Duration("duration", time.Since(start)),
				slog.String("ip", redactIP(r.RemoteAddr)),
			}

			if err, ok := httperr.Get(r.Context()); ok {
				attrs = append(attrs, slog.Any("error", err))
			}

			switch {
			case writerWithStatus.statusCode < http.StatusBadRequest:
				logger.Info("served request", attrs...)
			case writerWithStatus.statusCode < http.StatusInternalServerError:
				logger.Warn("served request", attrs...)
			default:
				logger.Error("served request", attrs...)
			}
		})
	}
}

func isStreamingRequest(r *http.Request) bool {
	return strings.EqualFold(r.Header.Get("Upgrade"), "websocket") || strings.Contains(r.Header.Get("Accept"), "text/event-stream")
}

func redactIP(addr string) string {
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return addr
	}

	ip := net.ParseIP(host)
	if ip == nil {
		return addr
	}

	if ipv4 := ip.To4(); ipv4 != nil {
		return fmt.Sprintf("%d.%d.%d.x", ipv4[0], ipv4[1], ipv4[2])
	}

	return addr
}
