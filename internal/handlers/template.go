package handlers

import (
	"context"
	"fmt"
	"html/template"
	"net/http"
	"path/filepath"

	"github.com/debobrad579/chessgo/internal/httperr"
)

func TemplateRenderer(file string, data any) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		RenderTemplate(r.Context(), w, file, data)
	})
}

func RenderTemplate(ctx context.Context, w http.ResponseWriter, file string, data any) {
	layoutPath := filepath.Join("views", "layout.html")
	pagePath := filepath.Join("views", file)

	tmpl, err := template.ParseFiles(layoutPath, pagePath)
	if err != nil {
		httperr.Write(ctx, w, http.StatusInternalServerError, fmt.Errorf("failed to parse files: %w", err))
		return
	}

	err = tmpl.ExecuteTemplate(w, "layout", data)
	if err != nil {
		httperr.Write(ctx, w, http.StatusInternalServerError, fmt.Errorf("failed to create template: %w", err))
	}
}
