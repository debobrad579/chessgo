include .env
export

DB_URL=postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@$(POSTGRES_HOST):$(POSTGRES_PORT)/$(POSTGRES_DB)?sslmode=disable

_air:
	@air

_npm:
	@npm run dev

dev:
	@echo "Starting development environment..."
	$(MAKE) _air &
	$(MAKE) _npm

build:
	@$(MAKE) lint
	@$(MAKE) test
	@rm -rf ./dist
	@mkdir -p ./dist
	@echo "Copying static assets..."
	@cp -r ./static ./dist/static
	@echo "Copying views..."
	@mkdir -p ./dist/app
	@cp -r ./views ./dist/views
	@cp ./app/index.html ./dist/app/index.html
	@echo "Building Go server..."
	@go build -o ./dist/main ./cmd/server
	@echo "Building React webapp..."
	@npm run build

preview:
	@test -f ./dist/main || (echo "Error: binary not found, run 'make build' first" && exit 1)
	@cd ./dist && ./main

lint:
	@echo "Linting Go..."
	@go vet ./...
	@echo "Linting TypeScript..."
	@npx tsc --noEmit

test:
	@echo "Testing Go..."
	@go test ./...

generate:
	@echo "Generating sqlc query code..."
	@sqlc generate

migrate-up:
	@goose -dir sql/schema postgres "$(DB_URL)" up

migrate-down:
	@goose -dir sql/schema postgres "$(DB_URL)" down

migrate-status:
	@goose -dir sql/schema postgres "$(DB_URL)" status
