package utils

import (
	"html/template"
	"net/http"
	"path/filepath"
)

func TemplateRenderer(file string, data any) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, _ *http.Request) {
		RenderTemplate(w, file, data)
	}
}

func RenderTemplate(w http.ResponseWriter, file string, data any) {
	layoutPath := filepath.Join("views", "layout.html")
	pagePath := filepath.Join("views", file)

	tmpl, err := template.ParseFiles(layoutPath, pagePath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = tmpl.ExecuteTemplate(w, "layout", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
