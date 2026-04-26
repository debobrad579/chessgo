package httperr

import (
	"context"
	"errors"
	"net/http"
)

type errorContext struct {
	error error
}

type contextKey string

const errContextKey contextKey = "err_context"

func NewContext(ctx context.Context) context.Context {
	return context.WithValue(ctx, errContextKey, &errorContext{})
}

func Write(ctx context.Context, w http.ResponseWriter, status int, err error) {
	if errCtx, ok := ctx.Value(errContextKey).(*errorContext); ok {
		errCtx.error = err
	}

	clientError := err
	switch status {
	case http.StatusUnauthorized:
		clientError = errors.New(http.StatusText(http.StatusUnauthorized))
	case http.StatusForbidden:
		clientError = errors.New(http.StatusText(http.StatusForbidden))
	case http.StatusInternalServerError:
		clientError = errors.New(http.StatusText(http.StatusInternalServerError))
	}

	http.Error(w, clientError.Error(), status)
}

func Get(ctx context.Context) (error, bool) {
	logCtx, ok := ctx.Value(errContextKey).(*errorContext)
	if !ok || logCtx.error == nil {
		return nil, false
	}
	return logCtx.error, true
}
