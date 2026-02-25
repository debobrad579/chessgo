include .env
export

migrate-up:
	@goose -dir sql/schema postgres "$(DB_URL)" up

migrate-down:
	@goose -dir sql/schema postgres "$(DB_URL)" down

migrate-status:
	@goose -dir sql/schema postgres "$(DB_URL)" status

lint:
	@echo "Linting Go..."
	@go vet ./...
	@echo "Linting TypeScript..."
	@npx tsc --noEmit

test:
	@go test ./...

build:
	@echo "Building Go server..."
	@sqlc generate && go build -o ./bin/main ./cmd/server
	@echo "Building React webapp..."
	@npm run build
	@echo "Building CSS..."
	@npm run build:css
	@echo "Build complete."

dev:
	@echo "Starting development environment..."
	$(MAKE) _air &
	$(MAKE) _npm
	@echo "Dev environment stopped"

_air:
	@air

_npm:
	@npm run dev
