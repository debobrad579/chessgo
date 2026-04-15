include .env
export

.PHONY: help install dev build preview lint test generate migrate up down status _air _npm

help:
	@printf "%-20s %s\n" "Command" "Description"
	@printf "%-20s %s\n" "-------" "-----------"
	@printf "%-20s %s\n" "make help" "Show available make targets"
	@printf "%-20s %s\n" "make install" "Download Go modules and install npm packages"
	@printf "%-20s %s\n" "make dev" "Start development environment"
	@printf "%-20s %s\n" "make build" "Build Go binary and frontend assets into /dist"
	@printf "%-20s %s\n" "make preview" "Serve the production build"
	@printf "%-20s %s\n" "make lint" "Lint Go and TypeScript"
	@printf "%-20s %s\n" "make test" "Run Go tests"
	@printf "%-20s %s\n" "make generate" "Regenerate sqlc query code"
	@printf "%-20s %s\n" "make migrate up" "Apply all pending database migrations"
	@printf "%-20s %s\n" "make migrate down" "Roll back the last migration"
	@printf "%-20s %s\n" "make migrate status" "Show current migration status"

install:
	@echo "Installing dependencies..."
	@go mod download
	@npm install

dev:
	@npx concurrently \
		-n GO,TAILWIND,VITE \
		-c blue,green,magenta \
		"script -q -c 'DEV=true air' /dev/null" \
		"npm run dev:css" \
		"npm run dev:js"

build:
	@$(MAKE) lint
	@$(MAKE) test
	@rm -rf ./dist
	@mkdir -p ./dist
	@echo "Building Go server..."
	@go build -o ./dist/main ./cmd/server
	@echo "Building React webapp..."
	@npm run build
	@cp -r ./views ./dist/views
	@cp -r ./static/. ./dist/static

preview:
	@test -f ./dist/main || (echo "Error: binary not found, run 'make build' first" && exit 1)
	@cd ./dist && ./main

lint:
	@echo "Linting Go..."
	@go vet ./...
	@echo "Linting TypeScript..."
	@npm run lint
	@echo "Checking types..."
	@npx tsc

test:
	@echo "Testing Go..."
	@go test ./...

generate:
	@echo "Generating sqlc query code..."
	@sqlc generate

migrate:
	@if [ -z "$(filter-out $@,$(MAKECMDGOALS))" ]; then \
		echo "Usage: make migrate [up|down|status]"; \
		exit 1; \
	fi
	@goose -dir sql/schema postgres "postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable" $(filter-out $@,$(MAKECMDGOALS))

up down status:
	@:
