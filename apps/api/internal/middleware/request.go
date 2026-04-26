package middleware

import (
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/debobrad579/chessgo/internal/appmetrics"
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
			if isStreamingRequest(r) || r.URL.Path == "/metrics" {
				next.ServeHTTP(w, r)
				return
			}

			start := time.Now()
			writerWithStatus := &responseWriterWithStatus{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}
			r = r.WithContext(httperr.NewContext(r.Context()))

			next.ServeHTTP(writerWithStatus, r)

			attrs := []any{
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
				slog.Int("status", writerWithStatus.statusCode),
				slog.Duration("duration", time.Since(start)),
			}

			userID, ok := GetUserID(r.Context())
			if ok {
				attrs = append(attrs, slog.String("user_id", userID.String()))
			}

			appmetrics.HttpRequestsTotal.
				WithLabelValues(
					r.Method,
					r.URL.Path,
					strconv.Itoa(writerWithStatus.statusCode),
					strconv.FormatBool(ok),
				).Inc()

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
